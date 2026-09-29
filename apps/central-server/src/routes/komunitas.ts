import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 80);
}

export default async function komunitasRoutes(app: FastifyInstance) {
  app.get('/api/komunitas', { preValidation: [authenticate] }, async (req: any) => {
    const { sub: userId } = req.user;
    const { q, type, status, sort = 'recent', limit = '30', offset = '0' } = req.query as Record<string, string>;

    const where: any = { authorId: userId };  // Hanya karya sendiri
    if (status && status !== 'Semua') where.status = status;
    if (type && type !== 'Semua') where.type = type;
    if (q?.trim()) where.title = { contains: q, mode: 'insensitive' };

    const orderBy: any = sort === 'popular' ? [{ likes: 'desc' }, { views: 'desc' }]
                        : sort === 'viewed'  ? [{ views: 'desc' }]
                        : [{ createdAt: 'desc' }];

    const [items, total] = await Promise.all([
      prisma.communityWork.findMany({
        where, orderBy,
        take: Math.min(Number(limit), 50), skip: Number(offset),
      }),
      prisma.communityWork.count({ where }),
    ]);
    return { items, total, limit: Number(limit), offset: Number(offset) };
  });

  app.get('/api/komunitas/stats', { preValidation: [authenticate] }, async (req: any) => {
    const { sub: userId } = req.user;
    const [draft, validasi, published, undangan, total] = await Promise.all([
      prisma.communityWork.count({ where: { authorId: userId, status: 'Draft' } }),
      prisma.communityWork.count({ where: { authorId: userId, status: 'Menunggu Validasi' } }),
      prisma.communityWork.count({ where: { authorId: userId, status: 'Published' } }),
      prisma.communityWork.count({ where: { authorId: userId, status: 'Undangan' } }),
      prisma.communityWork.count({ where: { authorId: userId } }),
    ]);
    return { draft, validasi, published, undangan, total };
  });

  app.get('/api/komunitas/:id', { preValidation: [authenticate] }, async (req: any, reply) => {
    const { id } = req.params as { id: string };
    const w = await prisma.communityWork.findFirst({ where: { OR: [{ id }, { slug: id }] } });
    if (!w) return reply.code(404).send({ error: 'Karya tidak ditemukan' });
    await prisma.communityWork.update({ where: { id: w.id }, data: { views: { increment: 1 } } });
    return { ...w, views: w.views + 1 };
  });

  app.post('/api/komunitas', { preValidation: [authenticate] }, async (req: any, reply) => {
    const { sub: userId, email } = req.user;
    const { title, description, content, type, category, status = 'Draft' } = req.body as any;
    if (!title?.trim() || !description?.trim()) {
      return reply.code(400).send({ error: 'Judul dan deskripsi wajib diisi' });
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const work = await prisma.communityWork.create({
      data: {
        title: title.trim(),
        slug: slugify(title) + '-' + Date.now().toString(36),
        description: description.trim(),
        content: content?.trim() || description,
        type: type ?? 'Dokumen',
        status,
        category,
        authorId: userId,
        authorName: user?.name ?? email,
        authorUnit: user?.unitKerja,
        region: user?.assignedRegion,
        publishedAt: status === 'Published' ? new Date() : null,
      },
    });
    return work;
  });

  app.patch('/api/komunitas/:id/submit', { preValidation: [authenticate] }, async (req: any) => {
    const { id } = req.params as { id: string };
    const work = await prisma.communityWork.update({
      where: { id },
      data: { status: 'Menunggu Validasi' },
    });
    return work;
  });

  app.delete('/api/komunitas/:id', { preValidation: [authenticate] }, async (req: any) => {
    const { id } = req.params as { id: string };
    await prisma.communityWork.delete({ where: { id } });
    return { ok: true };
  });
}