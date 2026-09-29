import { Worker } from 'bullmq';
import { redis, QUEUE_NAMES } from './index';

const REGION = process.env.REGION ?? 'kalimantan';

interface SyncResultData {
  edgeId: string;
  centralId: string;
  status: 'synced' | 'failed';
  error?: string;
}

export function startEdgeWorker() {
  const worker = new Worker<SyncResultData>(
    QUEUE_NAMES.RESULT,
    async (job) => {
      const { edgeId, centralId, status, error } = job.data;
      const key = `edge:usulan:${edgeId}`;
      const existing = await redis.get(key);

      if (!existing) {
        console.warn(`[edge-${REGION}-worker] No cache for ${edgeId}`);
        return;
      }

      const parsed = JSON.parse(existing);
      parsed.syncStatus = status;
      parsed.centralId = centralId;
      if (error) parsed.syncError = error;
      parsed.syncedAt = new Date().toISOString();

      await redis.set(key, JSON.stringify(parsed), 'EX', 3600);
      console.log(`[edge-${REGION}-worker] ${edgeId} -> ${status}`);
    },
    { connection: redis, concurrency: 5 }
  );

  worker.on('failed', (job, err) => {
    console.error(`[edge-${REGION}-worker] Job ${job?.id} failed:`, err.message);
  });

  console.log(`[edge-${REGION}-worker] Started`);
  return worker;
}