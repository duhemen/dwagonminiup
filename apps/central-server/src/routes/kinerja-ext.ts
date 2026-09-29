import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const prisma = new PrismaClient();

export default async function kinerjaExtRoutes(app: FastifyInstance) {
  // ============ SKP Documents (Cetak) ============
  app.get('/api/kinerja/documents', { preValidation: [authenticate] }, async (req: any) => {
    const { sub: userId } = req.user;
    const { kategori } = req.query as { kategori?: string };
    const where: any = { userId };
    if (kategori && kategori !== 'Semua') where.kategori = kategori;
    return prisma.sKPDocument.findMany({ where, orderBy: [{ kategori: 'asc' }, { createdAt: 'asc' }] });
  });

  app.post('/api/kinerja/documents/:id/download', { preValidation: [authenticate] }, async (req: any, reply) => {
    const { id } = req.params as { id: string };
    const doc = await prisma.sKPDocument.findUnique({ where: { id } });
    if (!doc) return reply.code(404).send({ error: 'Dokumen tidak ditemukan' });
    await prisma.sKPDocument.update({ where: { id }, data: { downloadedAt: new Date() } });
    return { ok: true, fileUrl: doc.fileUrl ?? `/api/kinerja/documents/${id}/file` };
  });

  // ============ HK Pengajuan ============
  app.get('/api/kinerja/hk', { preValidation: [authenticate] }, async (req: any) => {
    const { sub: userId } = req.user;
    const { status } = req.query as { status?: string };
    const where: any = { userId };
    if (status && status !== 'Semua') where.status = status;
    return prisma.hKPengajuan.findMany({ where, orderBy: { createdAt: 'desc' } });
  });

  app.post('/api/kinerja/hk', { preValidation: [authenticate] }, async (req: any, reply) => {
    const { sub: userId } = req.user;
    const { tahun, periode, alasan, kategori } = req.body as any;
    if (!alasan?.trim() || !kategori) {
      return reply.code(400).send({ error: 'Alasan dan kategori wajib' });
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const hk = await prisma.hKPengajuan.create({
      data: {
        userId, tahun: Number(tahun), periode, alasan: alasan.trim(), kategori,
        status: 'Draft',
        region: user?.assignedRegion,
      },
    });
    return hk;
  });

  app.post('/api/kinerja/hk/:id/submit', { preValidation: [authenticate] }, async (req: any, reply) => {
    const { id } = req.params as { id: string };
    const hk = await prisma.hKPengajuan.update({
      where: { id }, data: { status: 'Diajukan', submittedAt: new Date() },
    });
    return hk;
  });

  // ============ TTE ============
  app.get('/api/kinerja/tte', { preValidation: [authenticate] }, async (req: any) => {
    const { sub: userId } = req.user;
    const items = await prisma.tTEDocument.findMany({
      where: { userId }, orderBy: { createdAt: 'desc' },
    });
    return items.map((d) => ({ ...d, passphrase: undefined }));
  });

  app.post('/api/kinerja/tte', { preValidation: [authenticate] }, async (req: any, reply) => {
    const { sub: userId } = req.user;
    const { fileName, fileSize, mode = 'single', passphrase } = req.body as any;
    if (!fileName) return reply.code(400).send({ error: 'File wajib diupload' });
    if (!passphrase || passphrase.length < 4) {
      return reply.code(400).send({ error: 'Passphrase minimal 4 karakter' });
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const tte = await prisma.tTEDocument.create({
      data: {
        userId, fileName, fileSize, mode,
        passphrase: `***${passphrase.length}chars***`,
        status: 'Signed',
        certificate: `BSrE-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
        signedAt: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        docHash: Math.random().toString(36).slice(2, 34) + Math.random().toString(36).slice(2, 34),
        region: user?.assignedRegion,
      },
    });
    return { ...tte, passphrase: undefined };
  });

  // ============ Pengaturan Atasan ============
  app.get('/api/kinerja/pengaturan', { preValidation: [authenticate] }, async (req: any) => {
    const { sub: userId } = req.user;
    return prisma.pengaturanAtasan.findMany({
      where: { userId }, orderBy: { tahun: 'desc' },
    });
  });

  app.post('/api/kinerja/pengaturan', { preValidation: [authenticate] }, async (req: any, reply) => {
    const { sub: userId } = req.user;
    const body = req.body as any;
    if (!body.tahun) return reply.code(400).send({ error: 'Tahun wajib' });
    const setting = await prisma.pengaturanAtasan.upsert({
      where: { userId_tahun: { userId, tahun: Number(body.tahun) } },
      update: body,
      create: { ...body, tahun: Number(body.tahun), userId },
    });
    return setting;
  });

  app.delete('/api/kinerja/pengaturan/:id', { preValidation: [authenticate] }, async (req: any) => {
    const { id } = req.params as { id: string };
    await prisma.pengaturanAtasan.delete({ where: { id } });
    return { ok: true };
  });

  // ============ Download Docs ============
  app.get('/api/kinerja/downloads', async (req) => {
    const { category } = req.query as { category?: string };
    const where: any = {};
    if (category && category !== 'Semua') where.category = category;
    return prisma.downloadDoc.findMany({ where, orderBy: [{ year: 'desc' }, { title: 'asc' }] });
  });

  app.post('/api/kinerja/downloads/:id/download', async (req) => {
    const { id } = req.params as { id: string };
    await prisma.downloadDoc.update({ where: { id }, data: { downloads: { increment: 1 } } });
    return { ok: true };
  });

  // ============ Video Tutorials ============
  app.get('/api/kinerja/videos', async () => {
    return prisma.videoTutorial.findMany({ orderBy: { order: 'asc' } });
  });
}