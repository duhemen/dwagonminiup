import { PrismaClient } from '@prisma/client';
import { getStats as getWsStats } from '../websocket';
import { syncQueue, resultQueue } from '../queue';

const prisma = new PrismaClient();

const PORT_MAP: Record<string, number> = {
  'sumatera': 4001, 'jawa': 4002, 'kalimantan': 4003, 'bali-nusra': 4004,
  'sulawesi': 4005, 'maluku': 4006, 'papua': 4007,
};

const REGION_FLAGS: Record<string, string> = {
  'sumatera': '🌴', 'jawa': '🏙️', 'kalimantan': '🌳', 'bali-nusra': '🏖️',
  'sulawesi': '🦋', 'maluku': '🐚', 'papua': '🐦',
};

export interface MetricPoint {
  timestamp: number;
  wsConnections: number;
  syncQueueDepth: number;
  resultQueueDepth: number;
  syncJobsCompleted: number;
  syncJobsFailed: number;
  usulanTotal: number;
  latencyByRegion: Record<string, number>;
  edgeOnline: number;
}

const MAX_POINTS = 60;
const ring: MetricPoint[] = [];

let lastJobsCompleted = 0;
let lastJobsFailed = 0;

export async function collectMetrics(): Promise<MetricPoint> {
  const t0 = Date.now();

  // WS stats
  const wsStats = getWsStats();

  // Queue stats
  const [syncCounts, resultCounts] = await Promise.all([
    syncQueue.getJobCounts('waiting', 'active', 'completed', 'failed'),
    resultQueue.getJobCounts('waiting', 'active', 'completed', 'failed'),
  ]);

  // Latency per region
  const latencyByRegion: Record<string, number> = {};
  let edgeOnline = 0;

  await Promise.all(
    Object.entries(PORT_MAP).map(async ([region, port]) => {
      const t1 = Date.now();
      try {
        await fetch(`http://localhost:${port}/api/health`, { signal: AbortSignal.timeout(1200) });
        latencyByRegion[region] = Date.now() - t1;
        edgeOnline++;
      } catch {
        latencyByRegion[region] = 0;
      }
    })
  );

  const usulanTotal = await prisma.usulan.count();

  const point: MetricPoint = {
    timestamp: Date.now(),
    wsConnections: wsStats.connected,
    syncQueueDepth: (syncCounts.waiting ?? 0) + (syncCounts.active ?? 0),
    resultQueueDepth: (resultCounts.waiting ?? 0) + (resultCounts.active ?? 0),
    syncJobsCompleted: syncCounts.completed ?? 0,
    syncJobsFailed: syncCounts.failed ?? 0,
    usulanTotal,
    latencyByRegion,
    edgeOnline,
  };

  ring.push(point);
  if (ring.length > MAX_POINTS) ring.shift();

  return point;
}

export function getRecentMetrics(): MetricPoint[] {
  return [...ring];
}

export function getDeltas() {
  const latest = ring[ring.length - 1];
  if (!latest) return { jobsCompleted: 0, jobsFailed: 0 };
  const d = latest.syncJobsCompleted - lastJobsCompleted;
  const df = latest.syncJobsFailed - lastJobsFailed;
  lastJobsCompleted = latest.syncJobsCompleted;
  lastJobsFailed = latest.syncJobsFailed;
  return { jobsCompleted: d, jobsFailed: df };
}

let interval: NodeJS.Timeout | null = null;

export function startMetricsCollector(onCollect: (m: MetricPoint) => void) {
  if (interval) return;
  interval = setInterval(async () => {
    try {
      const m = await collectMetrics();
      onCollect(m);
    } catch (e: any) {
      console.warn('[metrics] Collect error:', e.message);
    }
  }, 2000);
  console.log('[metrics] Collector started (every 2s)');
}

export function stopMetricsCollector() {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
}