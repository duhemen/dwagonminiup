import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { emitToRole } from '../websocket';
import { createNotification, logActivity } from '../services/notification-service';

const prisma = new PrismaClient();
const STAGE_ORDER = ['pimpinan', 'upt', 'kepegawaian'];
const STAGE_LABELS: Record<string, string> = {
  pimpinan: 'Pimpinan', upt: 'Admin UPT', kepegawaian: 'Admin Kepegawaian',
};

export default async function approvalRoutes(app: FastifyInstance) {
  app.patch('/api/usulan/:id/approve', { preValidation: [authenticate] }, async (req: any, reply) => {
    const { id } = req.params as { id: string };
    const { stage, action, catatan } = req.body as { stage: string; action: 'setujui' | 'tolak'; catatan?: string };

    const userId = req.user.sub;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return reply.code(401).send({ error: 'User tidak ditemukan' });
    if (user.role !== stage && user.role !== 'admin') return reply.code(403).send({ error: `Hanya role "${stage}"` });

    const usulan = await prisma.usulan.findUnique({
      where: { id },
      include: { approvals: true, pelatihan: true, user: { select: { id: true, name: true, email: true, nip: true } } },
    });
    if (!usulan) return reply.code(404).send({ error: 'Usulan tidak ditemukan' });

    const currentApproval = usulan.approvals.find((a) => a.stage === stage);
    if (!currentApproval) return reply.code(400).send({ error: 'Tahap tidak ditemukan' });

    const idx = STAGE_ORDER.indexOf(stage);
    if (idx > 0) {
      const prevStage = STAGE_ORDER[idx - 1];
      const prev = usulan.approvals.find((a) => a.stage === prevStage);
      if (!prev || prev.status !== 'disetujui') return reply.code(400).send({ error: `Tahap "${prevStage}" harus disetujui dulu` });
    }

    const newStatus = action === 'setujui' ? 'disetujui' : 'ditolak';
    await prisma.approval.update({
      where: { id: currentApproval.id },
      data: { status: newStatus, catatan: catatan ?? null, decidedAt: new Date() },
    });

    const allApprovals = await prisma.approval.findMany({ where: { usulanId: id } });
    const anyRejected = allApprovals.some((a) => a.status === 'ditolak');
    const allApproved = allApprovals.every((a) => a.status === 'disetujui');
    let usulanStatus = 'menunggu';
    if (anyRejected) usulanStatus = 'ditolak';
    else if (allApproved) usulanStatus = 'disetujui';

    let nextStageUnlocked: string | null = null;
    if (action === 'setujui' && idx < STAGE_ORDER.length - 1) {
      const nextStage = STAGE_ORDER[idx + 1];
      const nextApp = allApprovals.find((a) => a.stage === nextStage);
      if (nextApp && nextApp.status === 'belum') {
        await prisma.approval.update({ where: { id: nextApp.id }, data: { status: 'menunggu' } });
        nextStageUnlocked = nextStage;
      }
    }

    const updated = await prisma.usulan.update({
      where: { id },
      data: { status: usulanStatus, catatan: catatan ?? usulan.catatan },
      include: { pelatihan: true, approvals: true, user: { select: { id: true, name: true, nip: true } } },
    });

    // ============ Persistent notifications ============
    const eventName = action === 'setujui' ? 'usulan:approved' : 'usulan:rejected';
    const label = STAGE_LABELS[stage] ?? stage;

    // 1. Notify usulan owner
    await createNotification({
      userId: usulan.userId,
      type: eventName,
      title: action === 'setujui' ? `✅ Usulan Disetujui oleh ${label}` : `❌ Usulan Ditolak oleh ${label}`,
      message: `"${usulan.pelatihan.nama}"`,
      detail: catatan ? `Catatan: ${catatan}` : undefined,
      data: { usulanId: id, stage, status: newStatus },
    });

    // 2. Notify next stage
    if (nextStageUnlocked) {
      const nextStageUsers = await prisma.user.findMany({ where: { role: nextStageUnlocked } });
      for (const u of nextStageUsers) {
        await createNotification({
          userId: u.id,
          type: 'usulan:created',
          title: '📬 Usulan Baru untuk Anda',
          message: `${usulan.user.name ?? usulan.user.email} — "${usulan.pelatihan.nama}"`,
          detail: `Region: ${usulan.edgeRegion ?? '-'} · Menunggu approval Anda`,
          data: { usulanId: id, stage: nextStageUnlocked },
        });
      }
      emitToRole(nextStageUnlocked, 'usulan:created', {
        usulanId: id,
        userName: usulan.user.name,
        userNip: usulan.user.nip,
        pelatihanNama: usulan.pelatihan.nama,
        kategori: usulan.kategori,
        region: usulan.edgeRegion,
        timestamp: new Date().toISOString(),
      });
    }

    // 3. Completed notif
    if (usulanStatus === 'disetujui' || usulanStatus === 'ditolak') {
      await createNotification({
        userId: usulan.userId,
        type: 'usulan:completed',
        title: usulanStatus === 'disetujui' ? '🎉 Usulan Disetujui Total' : '❌ Usulan Ditolak',
        message: `"${usulan.pelatihan.nama}"`,
        detail: usulanStatus === 'disetujui' ? 'Semua tahap approval selesai.' : 'Ditolak pada salah satu tahap.',
        data: { usulanId: id, finalStatus: usulanStatus },
      });
    }

    // 4. Log activity
    await logActivity({
      userId, action: `approval_${action}`,
      targetType: 'usulan', targetId: id,
      meta: { stage, usulanStatus, catatan },
      ip: req.ip, userAgent: req.headers['user-agent'],
    });

    return updated;
  });
}