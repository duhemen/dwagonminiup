import { api } from './client';

export interface EdgeNode {
  id: string;
  region: string;
  publicKey: string;
  fingerprint: string;
  endpoint: string | null;
  registeredAt: string;
  lastHeartbeat: string;
  status: string;
  totalSyncJobs: number;
  totalSyncFailed: number;
  isOnline: boolean;
}

export async function getEdgeRegistry(): Promise<EdgeNode[]> {
  const { data } = await api.get<EdgeNode[]>('/edge-registry');
  return data;
}