import { api } from './client';

export interface PembinaanKinerja {
  id: string;
  userId: string;
  pembinaId: string | null;
  pembinaNama: string | null;
  pembinaJabatan: string | null;
  tahun: number;
  tipe: string;
  teknik: string | null;
  rencanaHasilKerja: string;
  periode: string;
  tanggal: string;
  catatan: string | null;
  hasil: string | null;
  tindakLanjut: string | null;
  status: string;
  createdAt: string;
}

export interface PembinaanStats {
  bimbingan: number;
  konseling: number;
  selesai: number;
  terjadwal: number;
  total: number;
}

export async function getPembinaanList(params: { tahun?: string; tipe?: string } = {}): Promise<PembinaanKinerja[]> {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v && v !== 'Semua') qs.append(k, String(v)); });
  const { data } = await api.get<PembinaanKinerja[]>(`/kinerja/pembinaan?${qs.toString()}`);
  return data;
}

export async function getPembinaanStats(): Promise<PembinaanStats> {
  const { data } = await api.get<PembinaanStats>('/kinerja/pembinaan/stats');
  return data;
}

export async function createPembinaan(payload: any): Promise<PembinaanKinerja> {
  const { data } = await api.post<PembinaanKinerja>('/kinerja/pembinaan', payload);
  return data;
}

export async function updatePembinaan(id: string, payload: any): Promise<PembinaanKinerja> {
  const { data } = await api.patch<PembinaanKinerja>(`/kinerja/pembinaan/${id}`, payload);
  return data;
}