import { api } from './client';

export type Region = 'sumatera' | 'jawa' | 'kalimantan' | 'bali-nusra' | 'sulawesi' | 'maluku' | 'papua';

export interface DetectResponse {
  region: Region;
  detected: boolean;
  source: 'ip' | 'assigned' | 'profile' | 'locked' | 'default' | 'simulate';
  locked: boolean;
  ip?: string;
  fallbacks?: Region[];
}

export interface HealthResponse {
  timestamp: string;
  online: number;
  total: number;
  edges: Array<{ region: string; ok: boolean; port: number }>;
}

export async function detectRegion(simulateRegion?: string): Promise<DetectResponse> {
  const url = simulateRegion ? `/geo/detect?simulate_region=${simulateRegion}` : '/geo/detect';
  const { data } = await api.post<DetectResponse>(url);
  return data;
}

export async function lockRegion(region: Region) {
  const { data } = await api.post('/geo/lock', { region });
  return data;
}

export async function unlockRegion() {
  const { data } = await api.post('/geo/unlock');
  return data;
}

export async function checkHealth(): Promise<HealthResponse> {
  const { data } = await api.get<HealthResponse>('/geo/health');
  return data;
}