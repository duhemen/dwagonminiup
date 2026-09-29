import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const prisma = new PrismaClient();

export default async function enrollmentRoutes(app: FastifyInstance) {
  app.get('/api/enrollments', { preValidation: [authenticate] }, async (req) => {
    const { sub: userId } = req.user as { sub: string };
    return prisma.enrollment.findMany({
      where: { userId },
      include: { pelatihan: true },
      orderBy: { enrolledAt: 'desc' },
    });
  });

  app.post('/api/enrollments', { preValidation: [authenticate] }, async (req, reply) => {
    const { sub: userId } = req.user as { sub: string };
    const { pelatihanId } = req.body as { pelatihanId: string };
    if (!pelatihanId) return reply.code(400).send({ error: 'pelatihanId wajib' });

    const existing = await prisma.enrollment.findUnique({
      where: { userId_pelatihanId: { userId, pelatihanId } },
    });
    if (existing) return reply.code(409).send({ error: 'Sudah terdaftar' });

    return prisma.enrollment.create({
      data: { userId, pelatihanId },
      include: { pelatihan: true },
    });
  });

  app.delete('/api/enrollments/:id', { preValidation: [authenticate] }, async (req) => {
    const { id } = req.params as { id: string };
    await prisma.enrollment.delete({ where: { id } });
    return { ok: true };
  });
}