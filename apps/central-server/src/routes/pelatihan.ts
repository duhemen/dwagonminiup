import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function pelatihanRoutes(app: FastifyInstance) {
  app.get('/api/pelatihan', async (req) => {
    const { kategori } = req.query as { kategori?: string };
    return prisma.pelatihan.findMany({
      where: kategori ? { kategori } : undefined,
      orderBy: { nama: 'asc' },
    });
  });

  app.get('/api/pelatihan/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const item = await prisma.pelatihan.findUnique({ where: { id } });
    if (!item) return reply.code(404).send({ error: 'Pelatihan tidak ditemukan' });
    return item;
  });

  app.get('/api/pelatihan/kategori/list', async () => {
    return prisma.pelatihan.groupBy({
      by: ['kategori'],
      _count: { _all: true },
    });
  });
}