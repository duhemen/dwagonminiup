import { api } from './client';

export interface TalkshowEpisode {
  id: string;
  episodeNo: number;
  title: string;
  slug: string;
  description: string;
  poster: string | null;
  videoUrl: string | null;
  youtubeId: string | null;
  host: string | null;
  narasumber: string[];
  category: string | null;
  duration: string | null;
  airedAt: string;
  views: number;
  likes: number;
  commentsCount: number;
}

export async function getTalkshowList(params: {
  q?: string; category?: string; sort?: string; limit?: number; offset?: number;
} = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.append(k, String(v));
  });
  const { data } = await api.get<{ items: TalkshowEpisode[]; total: number }>(`/talkshow?${qs.toString()}`);
  return data;
}

export async function getTalkshowDetail(id: string) {
  const { data } = await api.get<TalkshowEpisode>(`/talkshow/${id}`);
  return data;
}

export async function getTalkshowCategories() {
  const { data } = await api.get<{ name: string | null; count: number }[]>('/talkshow/categories');
  return data;
}