import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const prisma = new PrismaClient();

export default async function userRoutes(app: FastifyInstance) {
  app.get('/api/users/me', { preValidation: [authenticate] }, async (req) => {
    const { sub } = req.user as { sub: string };
    return prisma.user.findUnique({
      where: { id: sub },
      select: {
        id: true, email: true, name: true, nip: true,
        jabatan: true, unitKerja: true, pendidikan: true,
        role: true, region: true,
      },
    });
  });

  app.get('/api/users', async () => {
    return prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, unitKerja: true },
    });
  });
}