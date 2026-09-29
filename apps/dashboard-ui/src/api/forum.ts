import { api } from './client';

export interface ForumTopic {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: string | null;
  authorId: string;
  authorName: string | null;
  isPinned: boolean;
  views: number;
  likes: number;
  repliesCount: number;
  lastReplyAt: string | null;
  createdAt: string;
}

export interface ForumReply {
  id: string;
  topicId: string;
  authorId: string;
  authorName: string | null;
  content: string;
  parentId: string | null;
  likes: number;
  createdAt: string;
}

export interface ForumDetail extends ForumTopic {
  replies: ForumReply[];
}

export async function getForumTopics(params: {
  q?: string; category?: string; sort?: string; limit?: number; offset?: number;
} = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.append(k, String(v));
  });
  const { data } = await api.get<{ items: ForumTopic[]; total: number }>(`/forum/topics?${qs.toString()}`);
  return data;
}

export async function getForumDetail(id: string) {
  const { data } = await api.get<ForumDetail>(`/forum/topics/${id}`);
  return data;
}

export async function getForumStats() {
  const { data } = await api.get<{ topics: number; replies: number; totalViews: number }>('/forum/stats');
  return data;
}

export async function createForumTopic(title: string, content: string, category?: string) {
  const { data } = await api.post<ForumTopic>('/forum/topics', { title, content, category });
  return data;
}

export async function createForumReply(topicId: string, content: string, parentId?: string) {
  const { data } = await api.post<ForumReply>(`/forum/topics/${topicId}/replies`, { content, parentId });
  return data;
}

export async function getForumCategories() {
  const { data } = await api.get<{ name: string | null; count: number }[]>('/forum/categories');
  return data;
}