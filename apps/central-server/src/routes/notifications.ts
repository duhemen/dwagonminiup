import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const prisma = new PrismaClient();

export default async function notificationRoutes(app: FastifyInstance) {
  // List notifikasi user
  app.get('/api/notifications', { preValidation: [authenticate] }, async (req: any) => {
    const { sub: userId } = req.user;
    const { unread, limit = '50' } = req.query as { unread?: string; limit?: string };
    return prisma.notification.findMany({
      where: { userId, ...(unread === 'true' ? { read: false } : {}) },
      orderBy: { createdAt: 'desc' },
      take: Math.min(Number(limit), 200),
    });
  });

  // Count unread
  app.get('/api/notifications/unread-count', { preValidation: [authenticate] }, async (req: any) => {
    const { sub: userId } = req.user;
    const count = await prisma.notification.count({ where: { userId, read: false } });
    return { count };
  });

  // Mark as read
  app.patch('/api/notifications/:id/read', { preValidation: [authenticate] }, async (req: any, reply) => {
    const { sub: userId } = req.user;
    const { id } = req.params as { id: string };
    const n = await prisma.notification.findFirst({ where: { id, userId } });
    if (!n) return reply.code(404).send({ error: 'Notifikasi tidak ditemukan' });
    await prisma.notification.update({ where: { id }, data: { read: true } });
    return { ok: true };
  });

  // Mark all as read
  app.patch('/api/notifications/read-all', { preValidation: [authenticate] }, async (req: any) => {
    const { sub: userId } = req.user;
    await prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
    return { ok: true };
  });

  // Clear all
  app.delete('/api/notifications', { preValidation: [authenticate] }, async (req: any) => {
    const { sub: userId } = req.user;
    await prisma.notification.deleteMany({ where: { userId } });
    return { ok: true };
  });

  // Activity log (milik sendiri)
  app.get('/api/activity', { preValidation: [authenticate] }, async (req: any) => {
    const { sub: userId } = req.user;
    const { limit = '50' } = req.query as { limit?: string };
    return prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: Math.min(Number(limit), 200),
    });
  });

  // Activity log (admin only - all users)
  app.get('/api/activity/all', { preValidation: [authenticate] }, async (req: any, reply) => {
    const { sub: userId } = req.user;
    const me = await prisma.user.findUnique({ where: { id: userId } });
    if (!me || !['admin', 'kepegawaian'].includes(me.role)) {
      return reply.code(403).send({ error: 'Akses terbatas' });
    }
    const { limit = '100' } = req.query as { limit?: string };
    return prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: Math.min(Number(limit), 500),
      include: { user: { select: { name: true, email: true, role: true } } },
    });
  });
}