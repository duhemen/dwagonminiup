import { syncQueue } from './index';
import { signPayload } from '@dwagon/shared-crypto';
import { getOrCreateKeypair } from '../crypto/keypair';

const REGION = process.env.REGION ?? 'kalimantan';

export interface SyncJobData {
  edgeId: string;
  userId: string;
  pelatihanId: string;
  kategori: string;
  region: string;
  requestedAt: string;
  signature: string;
}

export async function enqueueUsulanSync(payload: {
  edgeId: string;
  userId: string;
  pelatihanId: string;
  kategori: string;
  region: string;
  requestedAt: string;
}): Promise<string> {
  const kp = getOrCreateKeypair(REGION);

  // Sign canonical payload
  const signature = signPayload(
    {
      edgeId: payload.edgeId,
      userId: payload.userId,
      pelatihanId: payload.pelatihanId,
      kategori: payload.kategori,
      region: payload.region,
      requestedAt: payload.requestedAt,
    },
    kp.privateKey
  );

  const jobData: SyncJobData = { ...payload, signature };

  const job = await syncQueue.add('sync-usulan', jobData, {
    attempts: 5,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 100,
    removeOnFail: 200,
  });
  return job.id ?? 'unknown';
}