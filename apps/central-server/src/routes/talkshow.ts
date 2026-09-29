import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const prisma = new PrismaClient();

export default async function talkshowRoutes(app: FastifyInstance) {
  app.get('/api/talkshow', async (req) => {
    const { q, category, sort = 'recent', limit = '20', offset = '0' } = req.query as Record<string, string>;

    const where: any = {};
    if (category && category !== 'all') where.category = category;
    if (q && q.trim()) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = sort === 'viewed' ? [{ views: 'desc' }]
                        : sort === 'liked'  ? [{ likes: 'desc' }]
                        : [{ airedAt: 'desc' }];

    const [items, total] = await Promise.all([
      prisma.talkshowEpisode.findMany({
        where, orderBy,
        take: Math.min(Number(limit), 100), skip: Number(offset),
      }),
      prisma.talkshowEpisode.count({ where }),
    ]);

    return { items, total, limit: Number(limit), offset: Number(offset) };
  });

  app.get('/api/talkshow/categories', async () => {
    const cats = await prisma.talkshowEpisode.groupBy({
      by: ['category'],
      _count: { _all: true },
    });
    return cats.map((c) => ({ name: c.category, count: c._count._all }));
  });

  app.get('/api/talkshow/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const ep = await prisma.talkshowEpisode.findFirst({ where: { OR: [{ id }, { slug: id }] } });
    if (!ep) return reply.code(404).send({ error: 'Talkshow tidak ditemukan' });
    await prisma.talkshowEpisode.update({ where: { id: ep.id }, data: { views: { increment: 1 } } });
    return { ...ep, views: ep.views + 1 };
  });

  app.post('/api/talkshow/:id/like', { preValidation: [authenticate] }, async (req) => {
    const { id } = req.params as { id: string };
    const ep = await prisma.talkshowEpisode.update({
      where: { id }, data: { likes: { increment: 1 } },
    });
    return { likes: ep.likes };
  });
}