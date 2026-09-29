import { FastifyInstance } from 'fastify';
import { randomUUID } from 'crypto';
import { redis, syncQueue, resultQueue } from '../queue';
import { enqueueUsulanSync } from '../queue/producer';

const REGION = process.env.REGION ?? 'kalimantan';

export default async function usulanEdgeRoutes(app: FastifyInstance) {
  // POST /api/usulan — tulis cepat di edge, queue ke central
  app.post('/api/usulan', { preValidation: [(app as any).authenticate] }, async (req: any, reply) => {
    const { sub: userId, email } = req.user;
    const { pelatihanId, kategori } = req.body as { pelatihanId: string; kategori: string };

    if (!pelatihanId || !kategori) {
      return reply.code(400).send({ error: 'pelatihanId dan kategori wajib' });
    }

    const edgeId = `edge-${REGION}-${randomUUID().slice(0, 8)}`;
    const requestedAt = new Date().toISOString();

    const edgeDoc = {
      edgeId, userId, userEmail: email,
      pelatihanId, kategori, region: REGION,
      syncStatus: 'pending', requestedAt,
    };
    await redis.set(`edge:usulan:${edgeId}`, JSON.stringify(edgeDoc), 'EX', 3600);

    const jobId = await enqueueUsulanSync({
      edgeId, userId, pelatihanId, kategori, region: REGION, requestedAt,
    });

    return reply.code(202).send({
      edgeId, jobId,
      syncStatus: 'pending',
      region: REGION,
      message: `Usulan diterima di edge-${REGION}`,
    });
  });

  // GET /api/usulan/:edgeId — cek status sync
  app.get('/api/usulan/:edgeId', { preValidation: [(app as any).authenticate] }, async (req: any, reply) => {
    const { edgeId } = req.params as { edgeId: string };
    const data = await redis.get(`edge:usulan:${edgeId}`);
    if (!data) return reply.code(404).send({ error: 'Edge usulan tidak ditemukan' });
    return JSON.parse(data);
  });

  // GET /api/queue/stats
  app.get('/api/queue/stats', { preValidation: [(app as any).authenticate] }, async () => {
    const [syncCounts, resultCounts] = await Promise.all([
      syncQueue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed'),
      resultQueue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed'),
    ]);

    const recentSync = await syncQueue.getJobs(['completed', 'failed', 'active', 'waiting'], 0, 10);
    const recentResult = await resultQueue.getJobs(['completed', 'failed'], 0, 10);

    const mapJob = (j: any) => ({
      id: j.id, name: j.name, data: j.data,
      timestamp: j.timestamp, processedOn: j.processedOn, finishedOn: j.finishedOn,
      failedReason: j.failedReason, attemptsMade: j.attemptsMade,
      state: j.finishedOn ? (j.failedReason ? 'failed' : 'completed') : 'active',
    });

    return {
      region: REGION,
      queues: { sync: syncCounts, result: resultCounts },
      recentSync: recentSync.map(mapJob),
      recentResult: recentResult.map(mapJob),
    };
  });
}