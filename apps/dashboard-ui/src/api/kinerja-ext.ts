import { api } from './client';

export interface SKPDocument {
  id: string; kategori: string; subKategori: string | null;
  title: string; fileName: string | null; fileSize: string | null;
  status: string; downloadedAt: string | null;
}

export interface HKPengajuan {
  id: string; tahun: number; periode: string; alasan: string;
  kategori: string; status: string; tanggapan: string | null;
  catatanAtasan: string | null; submittedAt: string | null;
  resolvedAt: string | null; createdAt: string;
}

export interface TTEDocument {
  id: string; fileName: string; fileSize: string | null; status: string;
  mode: string; certificate: string | null; signedAt: string | null;
  expiresAt: string | null; docHash: string | null; createdAt: string;
}

export interface PengaturanAtasan {
  id: string; tahun: number; periode: string; jabatan: string; unitKerja: string;
  atasanNama: string | null; atasanNip: string | null; atasanJabatan: string | null;
  pejabatNama: string | null; pejabatNip: string | null; pejabatJabatan: string | null;
  pejabatTtdNama: string | null; pejabatTtdNip: string | null; pejabatTtdJabatan: string | null;
  isActive: boolean;
}

export interface DownloadDoc {
  id: string; title: string; description: string | null; category: string;
  fileName: string; fileSize: string | null; year: number | null;
  views: number; downloads: number;
}

export interface VideoTutorial {
  id: string; title: string; description: string | null;
  youtubeId: string | null; duration: string | null; category: string | null;
  views: number; order: number;
}

// Documents
export const getSKPDocuments = (kategori?: string) =>
  api.get<SKPDocument[]>(`/kinerja/documents${kategori && kategori !== 'Semua' ? `?kategori=${kategori}` : ''}`).then((r) => r.data);

export const downloadDocument = (id: string) =>
  api.post(`/kinerja/documents/${id}/download`).then((r) => r.data);

// HK
export const getHKList = (status?: string) =>
  api.get<HKPengajuan[]>(`/kinerja/hk${status && status !== 'Semua' ? `?status=${status}` : ''}`).then((r) => r.data);

export const createHK = (payload: any) =>
  api.post<HKPengajuan>('/kinerja/hk', payload).then((r) => r.data);

export const submitHK = (id: string) =>
  api.post(`/kinerja/hk/${id}/submit`).then((r) => r.data);

// TTE
export const getTTEList = () => api.get<TTEDocument[]>('/kinerja/tte').then((r) => r.data);
export const createTTE = (payload: any) => api.post<TTEDocument>('/kinerja/tte', payload).then((r) => r.data);

// Pengaturan
export const getPengaturan = () => api.get<PengaturanAtasan[]>('/kinerja/pengaturan').then((r) => r.data);
export const savePengaturan = (payload: any) => api.post<PengaturanAtasan>('/kinerja/pengaturan', payload).then((r) => r.data);
export const deletePengaturan = (id: string) => api.delete(`/kinerja/pengaturan/${id}`).then((r) => r.data);

// Downloads
export const getDownloadDocs = (category?: string) =>
  api.get<DownloadDoc[]>(`/kinerja/downloads${category && category !== 'Semua' ? `?category=${category}` : ''}`).then((r) => r.data);
export const downloadFile = (id: string) =>
  api.post(`/kinerja/downloads/${id}/download`).then((r) => r.data);

// Videos
export const getVideos = () => api.get<VideoTutorial[]>('/kinerja/videos').then((r) => r.data);