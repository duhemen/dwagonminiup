import { api, edgePath } from './client';

export interface UserProfile {
  id: string; email: string; name: string | null; nip: string | null;
  jabatan: string | null; unitKerja: string | null; pendidikan: string | null;
  role: string; region: string | null; assignedRegion: string | null;
  regionLocked: boolean;
}

export interface Pelatihan {
  id: string; nama: string; kategori: string; jp: number;
  penyelenggara: string; deskripsi: string | null; rating: number; totalPeserta: number;
}

export interface Approval {
  id: string; usulanId: string; stage: string; status: string;
  catatan: string | null; decidedAt: string | null;
}

export interface Usulan {
  id: string; userId: string; pelatihanId: string; kategori: string;
  status: string; tanggal: string; catatan: string | null;
  edgeId: string | null; edgeRegion: string | null;
  pelatihan: Pelatihan; approvals: Approval[];
}

export async function getProfile(): Promise<UserProfile> {
  const { data } = await api.get<UserProfile>('/users/me');
  return data;
}

export async function getPelatihanList(): Promise<Pelatihan[]> {
  const { data } = await api.get<Pelatihan[]>('/pelatihan');
  return data;
}

export async function getUsulanList(): Promise<Usulan[]> {
  const { data } = await api.get<Usulan[]>('/usulan');
  return data;
}

/** Submit usulan dengan auto-failover (via sync.ts) */
export async function createUsulan(pelatihanId: string, kategori: string) {
  // Import dinamis untuk hindari circular dep
  const { submitUsulanViaEdge } = await import('./sync');
  return submitUsulanViaEdge(pelatihanId, kategori);
}