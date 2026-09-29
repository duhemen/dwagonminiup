import { api } from './client';

export interface Jurnal {
  id: string; title: string; slug: string; bidang: string; publisher: string;
  issn: string | null; eissn: string | null; coverColor: string;
  description: string | null; frequency: string | null;
  year: number; volume: string | null; edition: string | null;
  views: number; downloads: number; articlesCount: number;
  articles?: JurnalArticle[];
}

export interface JurnalArticle {
  id: string; jurnalId: string; title: string; authors: string[];
  abstract: string; keywords: string[]; pages: string | null;
  doi: string | null; views: number; downloads: number; publishedAt: string;
}

export async function getJurnalList(params: any = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '' && v !== null) qs.append(k, String(v)); });
  const { data } = await api.get<{ items: Jurnal[]; total: number }>(`/jurnal?${qs.toString()}`);
  return data;
}

export async function getJurnalBidang() {
  const { data } = await api.get<{ name: string; count: number }[]>('/jurnal/bidang');
  return data;
}

export async function getJurnalYears() {
  const { data } = await api.get<number[]>('/jurnal/years');
  return data;
}

export async function getJurnalDetail(id: string) {
  const { data } = await api.get<Jurnal>(`/jurnal/${id}`);
  return data;
}