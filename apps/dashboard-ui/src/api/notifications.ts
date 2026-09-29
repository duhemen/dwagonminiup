import { api } from './client';

export interface NotificationRecord {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  detail: string | null;
  dataJson: string | null;
  read: boolean;
  createdAt: string;
}

export interface ActivityRecord {
  id: string;
  userId: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  metaJson: string | null;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
  user?: { name: string | null; email: string; role: string } | null;
}

export async function getNotifications(limit = 50): Promise<NotificationRecord[]> {
  const { data } = await api.get<NotificationRecord[]>(`/notifications?limit=${limit}`);
  return data;
}

export async function getUnreadCount(): Promise<number> {
  const { data } = await api.get<{ count: number }>('/notifications/unread-count');
  return data.count;
}

export async function markRead(id: string) {
  await api.patch(`/notifications/${id}/read`);
}

export async function markAllRead() {
  await api.patch('/notifications/read-all');
}

export async function clearNotifications() {
  await api.delete('/notifications');
}

export async function getActivity(limit = 50): Promise<ActivityRecord[]> {
  const { data } = await api.get<ActivityRecord[]>(`/activity?limit=${limit}`);
  return data;
}

export async function getAllActivity(limit = 100): Promise<ActivityRecord[]> {
  const { data } = await api.get<ActivityRecord[]>(`/activity/all?limit=${limit}`);
  return data;
}