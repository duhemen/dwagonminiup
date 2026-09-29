import { api } from './client';

export interface KnowledgeCategory {
  id: string;
  slug: string;
  name: string;
  icon: string;
  color: string;
  description: string | null;
  itemCount: number;
}

export interface KnowledgeItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: 'Dokumen' | 'Video' | 'Foto' | 'YouTube';
  thumbnail: string | null;
  tags: string[];
  views: number;
  likes: number;
  commentsCount: number;
  publishedAt: string;
  category: { slug: string; name: string; icon: string };
  author: { name: string | null; jabatan: string | null };
}

export interface KnowledgeDetail extends KnowledgeItem {
  content: string | null;
  fileUrl: string | null;
  videoUrl: string | null;
  duration: string | null;
  fileSize: string | null;
  author: { id: string; name: string | null; email: string; jabatan: string | null; unitKerja: string | null };
}

export interface KnowledgeListResponse {
  items: KnowledgeItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface KlopStats {
  totalItems: number;
  totalCategories: number;
  totalViews: number;
  totalLikes: number;
}

export async function getCategories(): Promise<KnowledgeCategory[]> {
  const { data } = await api.get<KnowledgeCategory[]>('/klop/categories');
  return data;
}

export async function getKnowledgeList(params: {
  q?: string;
  category?: string;
  type?: string;
  sort?: string;
  limit?: number;
  offset?: number;
}): Promise<KnowledgeListResponse> {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.append(k, String(v));
  });
  const { data } = await api.get<KnowledgeListResponse>(`/klop/knowledge?${qs.toString()}`);
  return data;
}

export async function getKnowledgeDetail(id: string): Promise<KnowledgeDetail> {
  const { data } = await api.get<KnowledgeDetail>(`/klop/knowledge/${id}`);
  return data;
}

export async function getComments(itemId: string) {
  const { data } = await api.get(`/klop/knowledge/${itemId}/comments`);
  return data;
}

export async function addComment(itemId: string, content: string) {
  const { data } = await api.post(`/klop/knowledge/${itemId}/comments`, { content });
  return data;
}

export async function toggleLike(itemId: string): Promise<{ liked: boolean }> {
  const { data } = await api.post(`/klop/knowledge/${itemId}/like`);
  return data;
}

export async function getKlopStats(): Promise<KlopStats> {
  const { data } = await api.get<KlopStats>('/klop/stats');
  return data;
}