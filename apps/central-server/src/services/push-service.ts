import { PrismaClient } from '@prisma/client';
import { getWebPush } from './vapid';

const prisma = new PrismaClient();

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
  data?: any;
}

export async function sendPushToUser(userId: string, payload: PushPayload) {
  const subs = await prisma.pushSubscription.findMany({ where: { userId } });
  if (subs.length === 0) return { sent: 0, failed: 0, removed: 0 };

  const wp = getWebPush();
  const pushPayload = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: payload.icon ?? '/icon-192.png',
    badge: payload.badge ?? '/badge-72.png',
    url: payload.url ?? '/',
    tag: payload.tag ?? 'dwagon',
    data: payload.data ?? {},
  });

  let sent = 0, failed = 0, removed = 0;

  for (const sub of subs) {
    try {
      await wp.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        pushPayload,
        { TTL: 60 * 60 * 24 }
      );
      sent++;
    } catch (e: any) {
      failed++;
      const code = e?.statusCode;
      if (code === 404 || code === 410) {
        await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
        removed++;
        console.log(`[push] Removed expired sub ${sub.id}`);
      } else {
        console.warn(`[push] Failed to send to ${sub.endpoint.slice(0, 40)}...: ${e.message}`);
      }
    }
  }

  return { sent, failed, removed };
}