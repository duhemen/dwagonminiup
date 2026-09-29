import { PrismaClient } from '@prisma/client';
import { emitToUser } from '../websocket';
import { sendPushToUser } from './push-service';

const prisma = new PrismaClient();

export interface CreateNotificationInput {
  userId: string;
  type: string;
  title: string;
  message: string;
  detail?: string;
  data?: any;
  emitLive?: boolean;
  sendPush?: boolean;
  pushUrl?: string;
}

export async function createNotification(input: CreateNotificationInput) {
  const notif = await prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      detail: input.detail,
      dataJson: input.data ? JSON.stringify(input.data) : null,
    },
  });

  if (input.emitLive !== false) {
    emitToUser(input.userId, 'notification:new', {
      id: notif.id,
      type: notif.type,
      title: notif.title,
      message: notif.message,
      detail: notif.detail,
      timestamp: notif.createdAt.toISOString(),
    });
  }

  // Web Push (OS-level notification)
  if (input.sendPush !== false) {
    try {
      await sendPushToUser(input.userId, {
        title: notif.title,
        body: notif.message + (notif.detail ? ` — ${notif.detail}` : ''),
        url: input.pushUrl ?? '/notifications',
        tag: `dwagon-${input.type}`,
        data: input.data ?? {},
      });
    } catch (e: any) {
      console.warn(`[push] Failed to send: ${e.message}`);
    }
  }

  return notif;
}

export async function logActivity(input: {
  userId?: string;
  action: string;
  targetType?: string;
  targetId?: string;
  meta?: any;
  ip?: string;
  userAgent?: string;
}) {
  return prisma.activityLog.create({
    data: {
      userId: input.userId,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      metaJson: input.meta ? JSON.stringify(input.meta) : null,
      ip: input.ip,
      userAgent: input.userAgent,
    },
  });
}