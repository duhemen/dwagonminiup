import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL ?? 'redis://localhost:6379';

export const redis = new Redis(REDIS_URL, { maxRetriesPerRequest: null });

export const syncQueue = new Queue('usulan-sync', { connection: redis });
export const resultQueue = new Queue('usulan-sync-result', { connection: redis });

export const QUEUE_NAMES = {
  SYNC: 'usulan-sync',
  RESULT: 'usulan-sync-result',
} as const;