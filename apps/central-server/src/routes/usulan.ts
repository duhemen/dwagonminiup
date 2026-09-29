import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const prisma = new PrismaClient();

export default async function usulanRoutes(app: FastifyInstance) {
  // Buat usulan baru
  app.post('/api/usulan', { preValidation: [authenticate] }, async (req, reply) => {
    const { sub: userId } = req.user as { sub: string };
    const { pelatihanId, kategori } = req.body as { pelatihanId: string; kategori: string };

    if (!pelatihanId || !kategori) {
      return reply.code(400).send({ error: 'pelatihanId dan kategori wajib diisi' });
    }

    const pelatihan = await prisma.pelatihan.findUnique({ where: { id: pelatihanId } });
    if (!pelatihan) return reply.code(404).send({ error: 'Pelatihan tidak ditemukan' });

    const usulan = await prisma.usulan.create({
      data: {
        userId,
        pelatihanId,
        kategori,
        status: 'menunggu',
        approvals: {
          create: [
            { stage: 'pimpinan', status: 'menunggu' },
            { stage: 'upt', status: 'belum' },
            { stage: 'kepegawaian', status: 'belum' },
          ],
        },
      },
      include: { pelatihan: true, approvals: true },
    });

    return usulan;
  });

  // Riwayat usulan milik user
  app.get('/api/usulan', { preValidation: [authenticate] }, async (req) => {
    const { sub: userId } = req.user as { sub: string };
    return prisma.usulan.findMany({
      where: { userId },
      include: { pelatihan: true, approvals: true },
      orderBy: { createdAt: 'desc' },
    });
  });

  // Detail usulan
  app.get('/api/usulan/:id', { preValidation: [authenticate] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const usulan = await prisma.usulan.findUnique({
      where: { id },
      include: { pelatihan: true, approvals: true, user: { select: { name: true, nip: true, unitKerja: true, jabatan: true } } },
    });
    if (!usulan) return reply.code(404).send({ error: 'Usulan tidak ditemukan' });
    return usulan;
  });

  // Daftar usulan pending ATAU history untuk approval (role-based)
  app.get('/api/usulan/pending/me', { preValidation: [authenticate] }, async (req) => {
    const { sub: userId } = req.user as { sub: string };
    const { mode } = req.query as { mode?: 'pending' | 'history' };
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return [];

    const stageMap: Record<string, string> = {
      pimpinan: 'pimpinan',
      upt: 'upt',
      kepegawaian: 'kepegawaian',
    };
    const stage = stageMap[user.role];
    if (!stage) return [];

    if (mode === 'history') {
      return prisma.usulan.findMany({
        where: {
          approvals: {
            some: { stage, status: { in: ['disetujui', 'ditolak'] } },
          },
        },
        include: {
          pelatihan: true,
          user: { select: { name: true, nip: true, unitKerja: true, jabatan: true } },
          approvals: true,
        },
        orderBy: { updatedAt: 'desc' },
        take: 50,
      });
    }

    return prisma.usulan.findMany({
      where: {
        approvals: { some: { stage, status: 'menunggu' } },
      },
      include: {
        pelatihan: true,
        user: { select: { name: true, nip: true, unitKerja: true, jabatan: true } },
        approvals: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  });

  // Stats untuk badge
  app.get('/api/usulan/stats/me', { preValidation: [authenticate] }, async (req) => {
    const { sub: userId } = req.user as { sub: string };
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { pending: 0, approved: 0, rejected: 0 };

    const stageMap: Record<string, string> = {
      pimpinan: 'pimpinan',
      upt: 'upt',
      kepegawaian: 'kepegawaian',
    };
    const stage = stageMap[user.role];
    if (!stage) return { pending: 0, approved: 0, rejected: 0 };

    const [pending, approved, rejected] = await Promise.all([
      prisma.usulan.count({ where: { approvals: { some: { stage, status: 'menunggu' } } } }),
      prisma.usulan.count({ where: { approvals: { some: { stage, status: 'disetujui' } } } }),
      prisma.usulan.count({ where: { approvals: { some: { stage, status: 'ditolak' } } } }),
    ]);

    return { pending, approved, rejected };
  });
}