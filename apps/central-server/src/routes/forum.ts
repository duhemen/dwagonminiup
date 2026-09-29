import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 80);
}

export default async function forumRoutes(app: FastifyInstance) {
  // Stats
  app.get('/api/forum/stats', async () => {
    const [topics, replies, totalViews] = await Promise.all([
      prisma.forumTopic.count(),
      prisma.forumReply.count(),
      prisma.forumTopic.aggregate({ _sum: { views: true } }),
    ]);
    return { topics, replies, totalViews: totalViews._sum.views ?? 0 };
  });

  // List topics
  app.get('/api/forum/topics', async (req) => {
    const { q, category, sort = 'recent', limit = '20', offset = '0' } = req.query as Record<string, string>;

    const where: any = {};
    if (category && category !== 'all') where.category = category;
    if (q && q.trim()) where.title = { contains: q, mode: 'insensitive' };

    const orderBy: any = sort === 'popular' ? [{ repliesCount: 'desc' }, { views: 'desc' }]
                        : sort === 'viewed'  ? [{ views: 'desc' }]
                        : [{ lastReplyAt: 'desc' }, { createdAt: 'desc' }];

    const [items, total] = await Promise.all([
      prisma.forumTopic.findMany({
        where, orderBy,
        take: Math.min(Number(limit), 100), skip: Number(offset),
      }),
      prisma.forumTopic.count({ where }),
    ]);

    return { items, total, limit: Number(limit), offset: Number(offset) };
  });

  // Categories
  app.get('/api/forum/categories', async () => {
    const cats = await prisma.forumTopic.groupBy({
      by: ['category'],
      _count: { _all: true },
    });
    return cats.map((c) => ({ name: c.category, count: c._count._all }));
  });

  // Detail + replies (nested)
  app.get('/api/forum/topics/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const topic = await prisma.forumTopic.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        replies: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!topic) return reply.code(404).send({ error: 'Topik tidak ditemukan' });

    await prisma.forumTopic.update({ where: { id: topic.id }, data: { views: { increment: 1 } } });
    return { ...topic, views: topic.views + 1 };
  });

  // Create topic
  app.post('/api/forum/topics', { preValidation: [authenticate] }, async (req: any, reply) => {
    const { sub: userId, email } = req.user;
    const { title, content, category } = req.body as { title: string; content: string; category?: string };

    if (!title?.trim() || !content?.trim()) {
      return reply.code(400).send({ error: 'Judul dan konten wajib diisi' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    const topic = await prisma.forumTopic.create({
      data: {
        title: title.trim(),
        slug: slugify(title) + '-' + Date.now().toString(36),
        content: content.trim(),
        category: category ?? 'Umum',
        authorId: userId,
        authorName: user?.name ?? email,
        lastReplyAt: new Date(),
        region: user?.assignedRegion,
      },
    });

    return topic;
  });

  // Reply (support nested)
  app.post('/api/forum/topics/:id/replies', { preValidation: [authenticate] }, async (req: any, reply) => {
    const { id } = req.params as { id: string };
    const { sub: userId, email } = req.user;
    const { content, parentId } = req.body as { content: string; parentId?: string };

    if (!content?.trim()) return reply.code(400).send({ error: 'Konten wajib diisi' });

    const user = await prisma.user.findUnique({ where: { id: userId } });

    const [rep] = await Promise.all([
      prisma.forumReply.create({
        data: {
          topicId: id,
          authorId: userId,
          authorName: user?.name ?? email,
          content: content.trim(),
          parentId: parentId ?? null,
        },
      }),
      prisma.forumTopic.update({
        where: { id },
        data: { repliesCount: { increment: 1 }, lastReplyAt: new Date() },
      }),
    ]);

    return rep;
  });

  // Like topic
  app.post('/api/forum/topics/:id/like', { preValidation: [authenticate] }, async (req) => {
    const { id } = req.params as { id: string };
    const t = await prisma.forumTopic.update({ where: { id }, data: { likes: { increment: 1 } } });
    return { likes: t.likes };
  });

  // Like reply
  app.post('/api/forum/replies/:id/like', { preValidation: [authenticate] }, async (req) => {
    const { id } = req.params as { id: string };
    const r = await prisma.forumReply.update({ where: { id }, data: { likes: { increment: 1 } } });
    return { likes: r.likes };
  });
}