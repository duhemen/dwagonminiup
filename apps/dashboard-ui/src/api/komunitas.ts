import { api } from './client';

export interface CommunityWork {
  id: string; title: string; slug: string; description: string; content: string | null;
  type: string; status: string; category: string | null;
  thumbnail: string | null; authorId: string; authorName: string | null; authorUnit: string | null;
  views: number; likes: number; commentsCount: number;
  publishedAt: string | null; createdAt: string;
}

export interface KomunitasStats {
  draft: number; validasi: number; published: number; undangan: number; total: number;
}

export async function getKomunitasList(params: any = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '' && v !== null) qs.append(k, String(v)); });
  const { data } = await api.get<{ items: CommunityWork[]; total: number }>(`/komunitas?${qs.toString()}`);
  return data;
}

export async function getKomunitasStats(): Promise<KomunitasStats> {
  const { data } = await api.get<KomunitasStats>('/komunitas/stats');
  return data;
}

export async function getKomunitasDetail(id: string) {
  const { data } = await api.get<CommunityWork>(`/komunitas/${id}`);
  return data;
}

export async function createKomunitas(payload: any) {
  const { data } = await api.post<CommunityWork>('/komunitas', payload);
  return data;
}

export async function submitKomunitas(id: string) {
  const { data } = await api.patch(`/komunitas/${id}/submit`);
  return data;
}

export async function deleteKomunitas(id: string) {
  await api.delete(`/komunitas/${id}`);
}