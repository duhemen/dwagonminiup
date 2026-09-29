import { api } from './client';

export interface SystemHealth {
  timestamp: string;
  totalLatencyMs: number;
  central: { ok: boolean; port: number; uptime: number };
  database: { ok: boolean; latency: number; provider: string };
  websocket: { connected: number; rooms: number };
  edges: {
    online: number;
    total: number;
    list: Array<{ region: string; port: number; ok: boolean; latency: number; fingerprint?: string; flag?: string; label?: string }>;
  };
  stats: { userCount: number; usulanCount: number; pelatihanCount: number; edgeCount: number; pendingApprovals: number };
}

export async function getSystemHealth(): Promise<SystemHealth> {
  const { data } = await api.get<SystemHealth>('/system/health');
  return data;
}