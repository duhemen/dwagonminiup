import { api } from './client';

export interface PelatihanLite {
  id: string;
  nama: string;
  kategori: string;
  jp: number;
  penyelenggara: string;
}

export interface ApprovalStage {
  id: string;
  usulanId: string;
  stage: string;
  status: string;
  catatan: string | null;
  decidedAt: string | null;
}

export interface UsulanApproval {
  id: string;
  userId: string;
  pelatihanId: string;
  kategori: string;
  status: string;
  tanggal: string;
  catatan: string | null;
  createdAt: string;
  updatedAt: string;
  pelatihan: PelatihanLite;
  user: {
    name: string;
    nip: string | null;
    unitKerja: string | null;
    jabatan: string | null;
  };
  approvals: ApprovalStage[];
}

export interface ApprovalStats {
  pending: number;
  approved: number;
  rejected: number;
}

export async function getPendingApprovals(): Promise<UsulanApproval[]> {
  const { data } = await api.get<UsulanApproval[]>('/usulan/pending/me');
  return data;
}

export async function getApprovalHistory(): Promise<UsulanApproval[]> {
  const { data } = await api.get<UsulanApproval[]>('/usulan/pending/me?mode=history');
  return data;
}

export async function getApprovalStats(): Promise<ApprovalStats> {
  const { data } = await api.get<ApprovalStats>('/usulan/stats/me');
  return data;
}

export async function decideApproval(
  usulanId: string,
  stage: string,
  action: 'setujui' | 'tolak',
  catatan?: string
): Promise<UsulanApproval> {
  const { data } = await api.patch<UsulanApproval>(`/usulan/${usulanId}/approve`, {
    stage,
    action,
    catatan,
  });
  return data;
}

export const STAGE_LABELS: Record<string, string> = {
  pimpinan: 'Pimpinan (Atasan Langsung)',
  upt: 'Admin UPT',
  kepegawaian: 'Admin Kepegawaian',
};