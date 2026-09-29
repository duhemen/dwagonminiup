import { Worker } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { redis, resultQueue, QUEUE_NAMES } from './index';
import { verifyPayload } from '@dwagon/shared-crypto';
import { emitToRole } from '../websocket';
import { createNotification, logActivity } from '../services/notification-service';

const prisma = new PrismaClient();

interface SyncJobData {
  edgeId: string; userId: string; pelatihanId: string; kategori: string;
  region: string; requestedAt: string; signature: string;
}

export function startCentralWorker() {
  const worker = new Worker<SyncJobData>(
    QUEUE_NAMES.SYNC,
    async (job) => {
      const { edgeId, userId, pelatihanId, kategori, region, requestedAt, signature } = job.data;
      console.log(`[central-worker] Processing ${edgeId} from ${region}`);

      const edge = await prisma.edgeNode.findUnique({ where: { region } });
      if (!edge) {
        await resultQueue.add('sync-confirm', { edgeId, centralId: '', status: 'failed', error: `Edge ${region} tidak terdaftar` });
        throw new Error(`Edge ${region} tidak terdaftar`);
      }

      const valid = verifyPayload(
        { edgeId, userId, pelatihanId, kategori, region, requestedAt },
        signature, edge.publicKey
      );

      if (!valid) {
        await prisma.edgeNode.update({ where: { region }, data: { totalSyncFailed: { increment: 1 } } });
        await resultQueue.add('sync-confirm', { edgeId, centralId: '', status: 'failed', error: 'Signature tidak valid' });
        throw new Error('Signature invalid');
      }

      console.log(`[central-worker] ✓ Signature valid dari edge-${region}`);
      await new Promise((r) => setTimeout(r, 1500));

      try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new Error(`User ${userId} tidak ditemukan`);
        const pelatihan = await prisma.pelatihan.findUnique({ where: { id: pelatihanId } });
        if (!pelatihan) throw new Error(`Pelatihan ${pelatihanId} tidak ditemukan`);

        const usulan = await prisma.usulan.create({
          data: {
            userId, pelatihanId, kategori, status: 'menunggu',
            edgeId, edgeRegion: region, signature,
            approvals: {
              create: [
                { stage: 'pimpinan', status: 'menunggu' },
                { stage: 'upt', status: 'belum' },
                { stage: 'kepegawaian', status: 'belum' },
              ],
            },
          },
        });

        await prisma.edgeNode.update({ where: { region }, data: { totalSyncJobs: { increment: 1 } } });
        await resultQueue.add('sync-confirm', { edgeId, centralId: usulan.id, status: 'synced' });

        console.log(`[central-worker] ${edgeId} -> synced as ${usulan.id}`);

        // ============ Persistent notification ke semua pimpinan ============
        const pimpinanUsers = await prisma.user.findMany({ where: { role: 'pimpinan' } });
        for (const p of pimpinanUsers) {
          await createNotification({
            userId: p.id,
            type: 'usulan:created',
            title: '📬 Usulan Baru Masuk',
            message: `${user.name ?? user.email} — "${pelatihan.nama}"`,
            detail: `Region: ${region} · Kategori: ${kategori}`,
            data: { usulanId: usulan.id, region, kategori },
          });
        }

        emitToRole('pimpinan', 'usulan:created', {
          usulanId: usulan.id,
          userName: user.name ?? user.email,
          userNip: user.nip,
          pelatihanNama: pelatihan.nama,
          kategori, region,
          timestamp: new Date().toISOString(),
        });

        // Log activity
        await logActivity({
          userId, action: 'submit_usulan',
          targetType: 'usulan', targetId: usulan.id,
          meta: { region, edgeId, pelatihan: pelatihan.nama },
        });

        return { centralId: usulan.id };
      } catch (err: any) {
        await prisma.edgeNode.update({ where: { region }, data: { totalSyncFailed: { increment: 1 } } });
        await resultQueue.add('sync-confirm', { edgeId, centralId: '', status: 'failed', error: err.message });
        throw err;
      }
    },
    { connection: redis, concurrency: 3 }
  );

  worker.on('failed', (job, err) => console.error(`[central-worker] Job ${job?.id} failed:`, err.message));
  console.log('[central-worker] Started with signature verification + WebSocket + Persistent Notifications');
  return worker;
}