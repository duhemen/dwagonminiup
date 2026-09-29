import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function jurnalRoutes(app: FastifyInstance) {
  app.get('/api/jurnal', async (req) => {
    const { q, bidang, year, limit = '20', offset = '0' } = req.query as Record<string, string>;
    const where: any = {};
    if (bidang && bidang !== 'all') where.bidang = bidang;
    if (year && year !== 'Semua') where.year = Number(year);
    if (q?.trim()) where.title = { contains: q, mode: 'insensitive' };

    const [items, total] = await Promise.all([
      prisma.jurnal.findMany({
        where, orderBy: { year: 'desc' },
        take: Math.min(Number(limit), 50), skip: Number(offset),
        include: { _count: { select: { articles: true } } },
      }),
      prisma.jurnal.count({ where }),
    ]);
    return { items, total, limit: Number(limit), offset: Number(offset) };
  });

  app.get('/api/jurnal/bidang', async () => {
    const result = await prisma.jurnal.groupBy({
      by: ['bidang'],
      _count: { _all: true },
    });
    return result.map((r) => ({ name: r.bidang, count: r._count._all }));
  });

  app.get('/api/jurnal/years', async () => {
    const years = await prisma.jurnal.findMany({
      select: { year: true }, distinct: ['year'], orderBy: { year: 'desc' },
    });
    return years.map((y) => y.year);
  });

  app.get('/api/jurnal/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const j = await prisma.jurnal.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: { articles: { orderBy: { publishedAt: 'desc' } } },
    });
    if (!j) return reply.code(404).send({ error: 'Jurnal tidak ditemukan' });
    await prisma.jurnal.update({ where: { id: j.id }, data: { views: { increment: 1 } } });
    return { ...j, views: j.views + 1 };
  });
}