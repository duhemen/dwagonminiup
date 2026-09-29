import { api, edgePath, edgePathFor } from './client';
import { Region } from './geo';

const ALL_REGIONS = ['sumatera', 'jawa', 'kalimantan', 'bali-nusra', 'sulawesi', 'maluku', 'papua'];

const FALLBACK_CHAIN: Record<string, string[]> = {
  'sumatera':   ['jawa', 'kalimantan'],
  'jawa':       ['sumatera', 'bali-nusra', 'kalimantan'],
  'kalimantan': ['jawa', 'sumatera', 'sulawesi'],
  'bali-nusra': ['jawa', 'sulawesi'],
  'sulawesi':   ['kalimantan', 'bali-nusra', 'maluku'],
  'maluku':     ['sulawesi', 'papua'],
  'papua':      ['maluku', 'sulawesi'],
};

export interface EdgeUsulanResponse {
  edgeId: string;
  jobId: string;
  syncStatus: 'pending' | 'synced' | 'failed';
  region: string;
  message: string;
  usedFallback?: boolean;
  originalRegion?: string;
}

export interface EdgeUsulanStatus {
  edgeId: string;
  userId: string;
  userEmail: string;
  pelatihanId: string;
  kategori: string;
  region: string;
  syncStatus: 'pending' | 'synced' | 'failed';
  centralId?: string;
  syncError?: string;
  requestedAt: string;
  syncedAt?: string;
}

export interface QueueJob {
  id: string; name: string; data: any;
  timestamp: number; processedOn?: number; finishedOn?: number;
  failedReason?: string; attemptsMade: number; state: string;
}

export interface QueueStats {
  region?: string;
  queues: { sync: Record<string, number>; result: Record<string, number> };
  recentSync: QueueJob[];
  recentResult: QueueJob[];
}

/** Submit usulan dengan auto-failover: coba primary → fallback 1 → fallback 2 */
export async function submitUsulanViaEdge(pelatihanId: string, kategori: string): Promise<EdgeUsulanResponse> {
  const primaryRegion = (localStorage.getItem('dwagon_region') ?? 'jawa') as Region;
  const chain = [primaryRegion, ...(FALLBACK_CHAIN[primaryRegion] ?? [])];

  const errors: string[] = [];
  for (let i = 0; i < chain.length; i++) {
    const region = chain[i];
    try {
      const { data } = await api.post<EdgeUsulanResponse>(edgePathFor(region, 'usulan'), { pelatihanId, kategori });
      return {
        ...data,
        usedFallback: i > 0,
        originalRegion: primaryRegion,
      };
    } catch (e: any) {
      errors.push(`${region}: ${e?.message ?? 'error'}`);
      console.warn(`[failover] ${region} failed, trying next...`);
    }
  }

  throw new Error(`Semua edge node down. Coba lagi nanti.\n${errors.join('\n')}`);
}

export async function getEdgeUsulanStatus(edgeId: string, region?: string): Promise<EdgeUsulanStatus> {
  const r = region ?? localStorage.getItem('dwagon_region') ?? 'jawa';
  const { data } = await api.get<EdgeUsulanStatus>(edgePathFor(r, `usulan/${edgeId}`));
  return data;
}

export async function getQueueStats(): Promise<QueueStats> {
  const { data } = await api.get<QueueStats>(edgePath('queue/stats'));
  return data;
}

export async function getAllRegionStats(): Promise<{ region: string; stats: QueueStats | null; error?: string }[]> {
  return Promise.all(ALL_REGIONS.map(async (r) => {
    try {
      const { data } = await api.get<QueueStats>(`/edge-${r}/queue/stats`);
      return { region: r, stats: data };
    } catch (e: any) {
      return { region: r, stats: null, error: e?.message ?? 'unreachable' };
    }
  }));
}

export async function checkRegionHealth(region: string) {
  try {
    const { data } = await api.get(`/edge-${region}/health`);
    return { ok: true, region, port: data.port };
  } catch {
    return { ok: false, region };
  }
}