import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const prisma = new PrismaClient();

export default async function klopRoutes(app: FastifyInstance) {
  // ===== Categories =====
  app.get('/api/klop/categories', async () => {
    const cats = await prisma.knowledgeCategory.findMany({
      orderBy: { order: 'asc' },
      include: { _count: { select: { items: true } } },
    });
    return cats.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      icon: c.icon,
      color: c.color,
      description: c.description,
      itemCount: c._count.items,
    }));
  });

  // ===== Knowledge List (search + filter + sort) =====
  app.get('/api/klop/knowledge', async (req) => {
    const {
      q,
      category,
      type,
      sort = 'recent',
      limit = '24',
      offset = '0',
    } = req.query as Record<string, string>;

    const where: any = {};
    if (category && category !== 'all') {
      where.category = { slug: category };
    }
    if (type && type !== 'Semua') {
      where.type = type;
    }
    if (q && q.trim()) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { tags: { has: q } },
      ];
    }

    const orderBy: any = (() => {
      switch (sort) {
        case 'popular':   return [{ likes: 'desc' }, { views: 'desc' }];
        case 'viewed':    return [{ views: 'desc' }];
        case 'commented': return [{ commentsCount: 'desc' }];
        case 'recent':
        default:          return [{ publishedAt: 'desc' }];
      }
    })();

    const [items, total] = await Promise.all([
      prisma.knowledgeItem.findMany({
        where,
        orderBy,
        take: Math.min(Number(limit), 100),
        skip: Number(offset),
        include: {
          category: { select: { slug: true, name: true, icon: true } },
          author: { select: { name: true, email: true, jabatan: true } },
        },
      }),
      prisma.knowledgeItem.count({ where }),
    ]);

    return {
      items: items.map((i) => ({
        id: i.id,
        title: i.title,
        slug: i.slug,
        description: i.description,
        type: i.type,
        thumbnail: i.thumbnail,
        tags: i.tags,
        views: i.views,
        likes: i.likes,
        commentsCount: i.commentsCount,
        publishedAt: i.publishedAt,
        category: i.category,
        author: { name: i.author.name, jabatan: i.author.jabatan },
      })),
      total,
      limit: Number(limit),
      offset: Number(offset),
    };
  });

  // ===== Knowledge Detail =====
  app.get('/api/klop/knowledge/:id', async (req, reply) => {
    const { id } = req.params as { id: string };

    const item = await prisma.knowledgeItem.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        category: { select: { slug: true, name: true, icon: true } },
        author: { select: { id: true, name: true, email: true, jabatan: true, unitKerja: true } },
      },
    });

    if (!item) return reply.code(404).send({ error: 'Knowledge tidak ditemukan' });

    // Increment views
    await prisma.knowledgeItem.update({
      where: { id: item.id },
      data: { views: { increment: 1 } },
    });

    return { ...item, views: item.views + 1 };
  });

  // ===== Comments =====
  app.get('/api/klop/knowledge/:id/comments', async (req) => {
    const { id } = req.params as { id: string };
    return prisma.knowledgeComment.findMany({
      where: { itemId: id },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    });
  });

  app.post('/api/klop/knowledge/:id/comments', { preValidation: [authenticate] }, async (req: any, reply) => {
    const { id } = req.params as { id: string };
    const { sub: userId } = req.user;
    const { content } = req.body as { content: string };

    if (!content || !content.trim()) {
      return reply.code(400).send({ error: 'Komentar tidak boleh kosong' });
    }

    const item = await prisma.knowledgeItem.findUnique({ where: { id } });
    if (!item) return reply.code(404).send({ error: 'Knowledge tidak ditemukan' });

    const [comment] = await Promise.all([
      prisma.knowledgeComment.create({
        data: { itemId: id, userId, content: content.trim() },
        include: { user: { select: { name: true, email: true } } },
      }),
      prisma.knowledgeItem.update({
        where: { id },
        data: { commentsCount: { increment: 1 } },
      }),
    ]);

    return comment;
  });

  // ===== Like / Unlike (toggle) =====
  app.post('/api/klop/knowledge/:id/like', { preValidation: [authenticate] }, async (req: any) => {
    const { id } = req.params as { id: string };
    const { sub: userId } = req.user;

    const existing = await prisma.knowledgeLike.findUnique({
      where: { itemId_userId: { itemId: id, userId } },
    });

    if (existing) {
      await Promise.all([
        prisma.knowledgeLike.delete({ where: { id: existing.id } }),
        prisma.knowledgeItem.update({ where: { id }, data: { likes: { decrement: 1 } } }),
      ]);
      return { liked: false };
    } else {
      await Promise.all([
        prisma.knowledgeLike.create({ data: { itemId: id, userId } }),
        prisma.knowledgeItem.update({ where: { id }, data: { likes: { increment: 1 } } }),
      ]);
      return { liked: true };
    }
  });

  // ===== Stats (untuk header) =====
  app.get('/api/klop/stats', async () => {
    const [totalItems, totalCategories, totalViews, totalLikes] = await Promise.all([
      prisma.knowledgeItem.count(),
      prisma.knowledgeCategory.count(),
      prisma.knowledgeItem.aggregate({ _sum: { views: true } }),
      prisma.knowledgeItem.aggregate({ _sum: { likes: true } }),
    ]);

    return {
      totalItems,
      totalCategories,
      totalViews: totalViews._sum.views ?? 0,
      totalLikes: totalLikes._sum.likes ?? 0,
    };
  });
}