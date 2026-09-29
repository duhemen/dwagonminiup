import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const prisma = new PrismaClient();

export default async function kinerjaRoutes(app: FastifyInstance) {
  // ===== List SKP user =====
  app.get('/api/kinerja/skp', { preValidation: [authenticate] }, async (req: any) => {
    const { sub: userId } = req.user;
    const { tahun, status } = req.query as { tahun?: string; status?: string };

    const where: any = { userId };
    if (tahun && tahun !== 'Semua') where.tahun = Number(tahun);
    if (status && status !== 'Semua') where.status = status;

    const items = await prisma.sKP.findMany({
      where,
      orderBy: { tahun: 'desc' },
      include: {
        rhkList: { orderBy: { urutan: 'asc' } },
        evaluasi: { orderBy: { triwulan: 'asc' } },
      },
    });

    return items;
  });

  // ===== Detail SKP =====
  app.get('/api/kinerja/skp/:id', { preValidation: [authenticate] }, async (req: any, reply) => {
    const { sub: userId } = req.user;
    const { id } = req.params as { id: string };

    const skp = await prisma.sKP.findFirst({
      where: { id, userId },
      include: {
        rhkList: { orderBy: { urutan: 'asc' } },
        evaluasi: { orderBy: { triwulan: 'asc' } },
      },
    });
    if (!skp) return reply.code(404).send({ error: 'SKP tidak ditemukan' });
    return skp;
  });

  // ===== Current SKP (tahun ini) =====
  app.get('/api/kinerja/skp/current', { preValidation: [authenticate] }, async (req: any) => {
    const { sub: userId } = req.user;
    const year = new Date().getFullYear();
    const skp = await prisma.sKP.findFirst({
      where: { userId, tahun: year },
      include: {
        rhkList: { orderBy: { urutan: 'asc' } },
        evaluasi: { orderBy: { triwulan: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return skp;
  });

  // ===== Stats =====
  app.get('/api/kinerja/stats', { preValidation: [authenticate] }, async (req: any) => {
    const { sub: userId } = req.user;

    const [total, disetujui, diajukan, draft] = await Promise.all([
      prisma.sKP.count({ where: { userId } }),
      prisma.sKP.count({ where: { userId, status: 'Disetujui' } }),
      prisma.sKP.count({ where: { userId, status: 'Diajukan' } }),
      prisma.sKP.count({ where: { userId, status: 'Draft' } }),
    ]);

    const avgNilai = await prisma.sKPEvaluation.aggregate({
      where: { skp: { userId }, nilai: { not: null } },
      _avg: { nilai: true },
    });

    return {
      total,
      disetujui,
      diajukan,
      draft,
      avgNilai: avgNilai._avg.nilai ?? 0,
    };
  });

  // ===== Create SKP =====
  app.post('/api/kinerja/skp', { preValidation: [authenticate] }, async (req: any, reply) => {
    const { sub: userId } = req.user;
    const body = req.body as any;

    if (!body.tahun || !body.periodeMulai || !body.periodeSelesai) {
      return reply.code(400).send({ error: 'Tahun dan periode wajib diisi' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return reply.code(404).send({ error: 'User tidak ditemukan' });

    const skp = await prisma.sKP.create({
      data: {
        userId,
        tahun: Number(body.tahun),
        periodeMulai: new Date(body.periodeMulai),
        periodeSelesai: new Date(body.periodeSelesai),
        jabatan: body.jabatan ?? user.jabatan ?? '-',
        unitKerja: body.unitKerja ?? user.unitKerja ?? '-',
        atasanNama: body.atasanNama,
        atasanNip: body.atasanNip,
        atasanJabatan: body.atasanJabatan,
        pejabatNama: body.pejabatNama,
        pejabatNip: body.pejabatNip,
        pejabatJabatan: body.pejabatJabatan,
        status: 'Draft',
        region: user.assignedRegion,
        rhkList: {
          create: (body.rhkList ?? []).map((r: any, i: number) => ({
            urutan: i + 1,
            rencanaHasilKerja: r.rencanaHasilKerja,
            indikator: r.indikator ?? [],
            target: r.target,
            satuan: r.satuan,
            cascading: 0,
          })),
        },
        evaluasi: {
          create: [1, 2, 3, 4].map((tw) => ({
            triwulan: tw,
            status: 'belum',
          })),
        },
      },
      include: {
        rhkList: true,
        evaluasi: true,
      },
    });

    return skp;
  });

  // ===== Update SKP =====
  app.patch('/api/kinerja/skp/:id', { preValidation: [authenticate] }, async (req: any, reply) => {
    const { sub: userId } = req.user;
    const { id } = req.params as { id: string };

    const existing = await prisma.sKP.findFirst({ where: { id, userId } });
    if (!existing) return reply.code(404).send({ error: 'SKP tidak ditemukan' });
    if (existing.status === 'Disetujui') {
      return reply.code(400).send({ error: 'SKP yang sudah disetujui tidak dapat diubah' });
    }

    const updated = await prisma.sKP.update({
      where: { id },
      data: req.body,
    });
    return updated;
  });

  // ===== Ajukan SKP =====
  app.post('/api/kinerja/skp/:id/submit', { preValidation: [authenticate] }, async (req: any, reply) => {
    const { sub: userId } = req.user;
    const { id } = req.params as { id: string };

    const existing = await prisma.sKP.findFirst({ where: { id, userId } });
    if (!existing) return reply.code(404).send({ error: 'SKP tidak ditemukan' });

    const updated = await prisma.sKP.update({
      where: { id },
      data: { status: 'Diajukan' },
    });
    return updated;
  });

  // ===== Rekap Nilai Kinerja (untuk tabel) =====
  app.get('/api/kinerja/rekap', { preValidation: [authenticate] }, async (req: any) => {
    const { sub: userId } = req.user;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return [];

    const skps = await prisma.sKP.findMany({
      where: { userId },
      orderBy: { tahun: 'desc' },
      include: { evaluasi: { orderBy: { triwulan: 'asc' } } },
    });

    return skps.map((s) => ({
      id: s.id,
      jabatan: s.jabatan + ', ' + s.unitKerja,
      tahun: s.tahun,
      periode: `${s.periodeMulai.toLocaleDateString('id-ID')} - ${s.periodeSelesai.toLocaleDateString('id-ID')}`,
      tw1: s.evaluasi.find((e) => e.triwulan === 1)?.predikat ?? null,
      tw2: s.evaluasi.find((e) => e.triwulan === 2)?.predikat ?? null,
      tw3: s.evaluasi.find((e) => e.triwulan === 3)?.predikat ?? null,
      tw4: s.evaluasi.find((e) => e.triwulan === 4)?.predikat ?? null,
      akhir: s.predikatAkhir,
      status: s.status,
    }));
  });
}