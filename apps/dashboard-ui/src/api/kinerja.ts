import { api } from './client';

export interface SKPRHK {
  id: string;
  skpId: string;
  urutan: number;
  rencanaHasilKerja: string;
  indikator: string[];
  target: string | null;
  satuan: string | null;
  cascading: number;
}

export interface SKPEvaluation {
  id: string;
  skpId: string;
  triwulan: number;
  predikat: string | null;
  nilai: number | null;
  catatan: string | null;
  dinilaiOleh: string | null;
  dinilaiAt: string | null;
  status: string;
}

export interface SKP {
  id: string;
  userId: string;
  tahun: number;
  periodeMulai: string;
  periodeSelesai: string;
  jabatan: string;
  unitKerja: string;
  atasanNama: string | null;
  atasanNip: string | null;
  atasanJabatan: string | null;
  pejabatNama: string | null;
  pejabatNip: string | null;
  pejabatJabatan: string | null;
  status: string;
  predikatAkhir: string | null;
  catatan: string | null;
  rhkList: SKPRHK[];
  evaluasi: SKPEvaluation[];
  createdAt: string;
}

export interface KinerjaStats {
  total: number;
  disetujui: number;
  diajukan: number;
  draft: number;
  avgNilai: number;
}

export interface RekapItem {
  id: string;
  jabatan: string;
  tahun: number;
  periode: string;
  tw1: string | null;
  tw2: string | null;
  tw3: string | null;
  tw4: string | null;
  akhir: string | null;
  status: string;
}

export async function getSKPList(params: { tahun?: string; status?: string } = {}): Promise<SKP[]> {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v) qs.append(k, String(v)); });
  const { data } = await api.get<SKP[]>(`/kinerja/skp?${qs.toString()}`);
  return data;
}

export async function getSKPDetail(id: string): Promise<SKP> {
  const { data } = await api.get<SKP>(`/kinerja/skp/${id}`);
  return data;
}

export async function getCurrentSKP(): Promise<SKP | null> {
  const { data } = await api.get<SKP | null>('/kinerja/skp/current');
  return data;
}

export async function getKinerjaStats(): Promise<KinerjaStats> {
  const { data } = await api.get<KinerjaStats>('/kinerja/stats');
  return data;
}

export async function getRekap(): Promise<RekapItem[]> {
  const { data } = await api.get<RekapItem[]>('/kinerja/rekap');
  return data;
}

export async function createSKP(payload: any) {
  const { data } = await api.post<SKP>('/kinerja/skp', payload);
  return data;
}

export async function submitSKP(id: string) {
  const { data } = await api.post<SKP>(`/kinerja/skp/${id}/submit`);
  return data;
}