import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const prisma = new PrismaClient();

export default async function finalBatchRoutes(app: FastifyInstance) {
  // ============ 19.9 REKAP KOMPETENSI ============
  app.get('/api/kinerja/rekap-kompetensi', { preValidation: [authenticate] }, async (req: any) => {
    const { sub: userId } = req.user;
    const { tahun } = req.query as { tahun?: string };
    const where: any = { userId };
    if (tahun && tahun !== 'Semua') where.tahun = Number(tahun);
    return prisma.rekapKompetensi.findMany({ where, orderBy: { tglMulai: 'desc' } });
  });

  app.get('/api/kinerja/rekap-kompetensi/stats', { preValidation: [authenticate] }, async (req: any) => {
    const { sub: userId } = req.user;
    const year = new Date().getFullYear();
    const [total, totalJP, perYear] = await Promise.all([
      prisma.rekapKompetensi.count({ where: { userId } }),
      prisma.rekapKompetensi.aggregate({ where: { userId }, _sum: { jumlahJP: true } }),
      prisma.rekapKompetensi.groupBy({ by: ['tahun'], where: { userId }, _sum: { jumlahJP: true } }),
    ]);
    return {
      total, totalJP: totalJP._sum.jumlahJP ?? 0,
      perYear: perYear.map((y) => ({ tahun: y.tahun, jp: y._sum.jumlahJP ?? 0 })),
    };
  });

  // ============ 19.10 KARYASISWA ============
  app.get('/api/karyasiswa', { preValidation: [authenticate] }, async (req: any) => {
    const { sub: userId } = req.user;
    const { status } = req.query as { status?: string };
    const where: any = { userId };
    if (status && status !== 'Semua') where.status = status;
    return prisma.karyasiswa.findMany({ where, orderBy: { tanggalPengajuan: 'desc' } });
  });

  app.post('/api/karyasiswa', { preValidation: [authenticate] }, async (req: any, reply) => {
    const { sub: userId } = req.user;
    const body = req.body as any;
    if (!body.program || !body.universitas) return reply.code(400).send({ error: 'Program & universitas wajib' });
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const k = await prisma.karyasiswa.create({
      data: {
        userId, program: body.program, universitas: body.universitas,
        jenjang: body.jenjang ?? 'S2', lokasiStudi: body.lokasiStudi ?? '-',
        tanggalPengajuan: new Date(), status: 'Draft',
        tahunAkademik: body.tahunAkademik ?? new Date().getFullYear() + 1,
        durasi: body.durasi, catatan: body.catatan, isBeasiswa: body.isBeasiswa ?? false,
        pengirim: 'Admin Unit Organisasi', region: user?.assignedRegion,
      },
    });
    return k;
  });

  app.post('/api/karyasiswa/:id/submit', { preValidation: [authenticate] }, async (req: any) => {
    const { id } = req.params as { id: string };
    return prisma.karyasiswa.update({ where: { id }, data: { status: 'Menunggu Validasi' } });
  });

  // ============ 19.11 SPASI (Venue Booking) ============
  app.get('/api/spasi/venues', { preValidation: [authenticate] }, async (req: any) => {
    const { tipe } = req.query as { tipe?: string };
    const where: any = {};
    if (tipe && tipe !== 'Semua') where.tipe = tipe;
    return prisma.venue.findMany({ where, orderBy: { nama: 'asc' } });
  });

  app.get('/api/spasi/venues/:id', { preValidation: [authenticate] }, async (req: any, reply) => {
    const { id } = req.params as { id: string };
    const v = await prisma.venue.findFirst({ where: { OR: [{ id }, { slug: id }] } });
    if (!v) return reply.code(404).send({ error: 'Venue tidak ditemukan' });
    return v;
  });

  app.get('/api/spasi/bookings', { preValidation: [authenticate] }, async (req: any) => {
    const { sub: userId } = req.user;
    return prisma.venueBooking.findMany({
      where: { userId },
      include: { venue: { select: { nama: true, tipe: true, lokasi: true } } },
      orderBy: { createdAt: 'desc' },
    });
  });

  app.post('/api/spasi/bookings', { preValidation: [authenticate] }, async (req: any, reply) => {
    const { sub: userId } = req.user;
    const { venueId, tanggalMulai, tanggalSelesai, keperluan, jumlahOrang } = req.body as any;
    if (!venueId || !tanggalMulai || !tanggalSelesai || !keperluan) {
      return reply.code(400).send({ error: 'Data wajib diisi' });
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const b = await prisma.venueBooking.create({
      data: {
        venueId, userId,
        tanggalMulai: new Date(tanggalMulai),
        tanggalSelesai: new Date(tanggalSelesai),
        keperluan, jumlahOrang: Number(jumlahOrang) || 1,
        status: 'Menunggu',
        region: user?.assignedRegion,
      },
    });
    return b;
  });

  // ============ 19.12 TICKETING DATIN ============
  app.get('/api/ticketing', { preValidation: [authenticate] }, async (req: any) => {
    const { sub: userId } = req.user;
    const { status } = req.query as { status?: string };
    const where: any = { userId };
    if (status && status !== 'Semua') where.status = status;
    return prisma.ticket.findMany({ where, orderBy: { createdAt: 'desc' } });
  });

  app.get('/api/ticketing/stats', { preValidation: [authenticate] }, async (req: any) => {
    const { sub: userId } = req.user;
    const [total, proses, selesai, terbuka] = await Promise.all([
      prisma.ticket.count({ where: { userId } }),
      prisma.ticket.count({ where: { userId, status: 'Diproses' } }),
      prisma.ticket.count({ where: { userId, status: 'Selesai' } }),
      prisma.ticket.count({ where: { userId, status: 'Terbuka' } }),
    ]);
    return { total, proses, selesai, terbuka };
  });

  app.post('/api/ticketing', { preValidation: [authenticate] }, async (req: any, reply) => {
    const { sub: userId } = req.user;
    const { judul, kategori, deskripsi, prioritas } = req.body as any;
    if (!judul || !kategori || !deskripsi) return reply.code(400).send({ error: 'Judul, kategori, deskripsi wajib' });
    const year = new Date().getFullYear();
    const count = await prisma.ticket.count({ where: { ticketNo: { startsWith: `TKT-${year}-` } } });
    const ticketNo = `TKT-${year}-${String(count + 1).padStart(4, '0')}`;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    return prisma.ticket.create({
      data: {
        userId, ticketNo, judul, kategori, deskripsi,
        prioritas: prioritas ?? 'Normal', status: 'Terbuka',
        region: user?.assignedRegion,
      },
    });
  });
}