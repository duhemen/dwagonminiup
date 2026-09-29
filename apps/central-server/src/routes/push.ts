import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { getVapidKeys } from '../services/vapid';

const prisma = new PrismaClient();

export default async function pushRoutes(app: FastifyInstance) {
  // Get VAPID public key (frontend butuh ini untuk subscribe)
  app.get('/api/push/vapid-key', async () => {
    const kp = getVapidKeys();
    return { publicKey: kp.publicKey };
  });

  // Subscribe
  app.post('/api/push/subscribe', { preValidation: [authenticate] }, async (req: any, reply) => {
    const { sub: userId } = req.user;
    const { endpoint, keys, userAgent } = req.body as {
      endpoint: string;
      keys: { p256dh: string; auth: string };
      userAgent?: string;
    };

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return reply.code(400).send({ error: 'endpoint & keys wajib' });
    }

    await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: { userId, p256dh: keys.p256dh, auth: keys.auth, userAgent },
      create: { userId, endpoint, p256dh: keys.p256dh, auth: keys.auth, userAgent },
    });

    return { ok: true };
  });

  // Unsubscribe
  app.post('/api/push/unsubscribe', { preValidation: [authenticate] }, async (req: any) => {
    const { endpoint } = req.body as { endpoint: string };
    if (endpoint) {
      await prisma.pushSubscription.delete({ where: { endpoint } }).catch(() => {});
    }
    return { ok: true };
  });

  // Info subscriptions user (untuk stats di UI)
  app.get('/api/push/status', { preValidation: [authenticate] }, async (req: any) => {
    const { sub: userId } = req.user;
    const count = await prisma.pushSubscription.count({ where: { userId } });
    return { subscribed: count > 0, count };
  });
}