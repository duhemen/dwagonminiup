import { FastifyInstance } from 'fastify';
import { syncQueue, resultQueue } from '../queue';
import { authenticate } from '../middleware/auth';

export default async function syncRoutes(app: FastifyInstance) {
  app.get('/api/sync/queue/stats', { preValidation: [authenticate] }, async () => {
    const [syncCounts, resultCounts] = await Promise.all([
      syncQueue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed'),
      resultQueue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed'),
    ]);

    const recentSync = await syncQueue.getJobs(['completed', 'failed', 'active', 'waiting'], 0, 10);
    const recentResult = await resultQueue.getJobs(['completed', 'failed'], 0, 10);

    const mapJob = (j: any) => ({
      id: j.id,
      name: j.name,
      data: j.data,
      timestamp: j.timestamp,
      processedOn: j.processedOn,
      finishedOn: j.finishedOn,
      failedReason: j.failedReason,
      attemptsMade: j.attemptsMade,
      state: j.finishedOn ? (j.failedReason ? 'failed' : 'completed') : 'active',
    });

    return {
      queues: { sync: syncCounts, result: resultCounts },
      recentSync: recentSync.map(mapJob),
      recentResult: recentResult.map(mapJob),
    };
  });
}