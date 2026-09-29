import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const prisma = new PrismaClient();

export default async function pembinaanRoutes(app: FastifyInstance) {
  // List pembinaan
  app.get('/api/kinerja/pembinaan', { preValidation: [authenticate] }, async (req: any) => {
    const { sub: userId } = req.user;
    const { tahun, tipe } = req.query as { tahun?: string; tipe?: string };

    const where: any = { userId };
    if (tahun && tahun !== 'Semua') where.tahun = Number(tahun);
    if (tipe && tipe !== 'Semua') where.tipe = tipe;

    return prisma.pembinaanKinerja.findMany({
      where,
      orderBy: [{ tanggal: 'desc' }],
    });
  });

  // Stats
  app.get('/api/kinerja/pembinaan/stats', { preValidation: [authenticate] }, async (req: any) => {
    const { sub: userId } = req.user;
    const year = new Date().getFullYear();

    const [bimbingan, konseling, selesai, terjadwal] = await Promise.all([
      prisma.pembinaanKinerja.count({ where: { userId, tahun: year, tipe: 'Bimbingan' } }),
      prisma.pembinaanKinerja.count({ where: { userId, tahun: year, tipe: 'Konseling' } }),
      prisma.pembinaanKinerja.count({ where: { userId, tahun: year, status: 'Selesai' } }),
      prisma.pembinaanKinerja.count({ where: { userId, tahun: year, status: 'Terjadwal' } }),
    ]);

    return { bimbingan, konseling, selesai, terjadwal, total: bimbingan + konseling };
  });

  // Detail
  app.get('/api/kinerja/pembinaan/:id', { preValidation: [authenticate] }, async (req: any, reply) => {
    const { id } = req.params as { id: string };
    const item = await prisma.pembinaanKinerja.findUnique({ where: { id } });
    if (!item) return reply.code(404).send({ error: 'Data tidak ditemukan' });
    return item;
  });

  // Create
  app.post('/api/kinerja/pembinaan', { preValidation: [authenticate] }, async (req: any, reply) => {
    const { sub: userId } = req.user;
    const body = req.body as any;

    if (!body.tipe || !body.rencanaHasilKerja || !body.periode) {
      return reply.code(400).send({ error: 'Tipe, RHK, dan periode wajib diisi' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const year = body.tahun ?? new Date().getFullYear();

    const item = await prisma.pembinaanKinerja.create({
      data: {
        userId,
        pembinaId: body.pembinaId,
        pembinaNama: body.pembinaNama ?? user?.name,
        pembinaJabatan: body.pembinaJabatan,
        tahun: Number(year),
        tipe: body.tipe,
        teknik: body.teknik,
        rencanaHasilKerja: body.rencanaHasilKerja,
        periode: body.periode,
        tanggal: body.tanggal ? new Date(body.tanggal) : new Date(),
        catatan: body.catatan,
        status: body.status ?? 'Terjadwal',
        region: user?.assignedRegion,
      },
    });

    return item;
  });

  // Update status
  app.patch('/api/kinerja/pembinaan/:id', { preValidation: [authenticate] }, async (req: any, reply) => {
    const { id } = req.params as { id: string };
    const existing = await prisma.pembinaanKinerja.findUnique({ where: { id } });
    if (!existing) return reply.code(404).send({ error: 'Data tidak ditemukan' });

    return prisma.pembinaanKinerja.update({
      where: { id },
      data: req.body,
    });
  });
}