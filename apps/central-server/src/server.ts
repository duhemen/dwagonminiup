import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { PrismaClient } from '@prisma/client';

import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import pelatihanRoutes from './routes/pelatihan';
import usulanRoutes from './routes/usulan';
import approvalRoutes from './routes/approval';
import enrollmentRoutes from './routes/enrollment';
import syncRoutes from './routes/sync';
import edgeRegistryRoutes from './routes/edge-registry';
import geoRoutes from './routes/geo';
import notificationRoutes from './routes/notifications';
import systemRoutes from './routes/system';
import pushRoutes from './routes/push';
import klopRoutes from './routes/klop';
import elearningRoutes from './routes/elearning';
import talkshowRoutes from './routes/talkshow';
import jurnalRoutes from './routes/jurnal';
import komunitasRoutes from './routes/komunitas';
import kinerjaRoutes from './routes/kinerja';
import kinerjaExtRoutes from './routes/kinerja-ext';
import finalBatchRoutes from './routes/final-batch';
import pembinaanRoutes from './routes/pembinaan';
import forumRoutes from './routes/forum';
import { startCentralWorker } from './queue/worker';
import { initWebSocket, getStats as getWsStats } from './websocket';
import { getRecentMetrics } from './services/metrics-service';

const app = Fastify({ logger: true });
const prisma = new PrismaClient();

declare module 'fastify' { interface FastifyInstance { prisma: PrismaClient; } }
app.decorate('prisma', prisma);

async function bootstrap() {
  await app.register(cors, { origin: true });
  await app.register(jwt, { secret: process.env.JWT_SECRET ?? 'dev-secret' });

  app.get('/api/health', async () => ({ status: 'ok', service: 'central-server', region: 'jakarta' }));
  app.get('/api/ws/stats', async () => getWsStats());
  app.get('/api/metrics/recent', async () => ({ points: getRecentMetrics() }));

  await app.register(authRoutes);
  await app.register(userRoutes);
  await app.register(pelatihanRoutes);
  await app.register(usulanRoutes);
  await app.register(approvalRoutes);
  await app.register(enrollmentRoutes);
  await app.register(syncRoutes);
  await app.register(edgeRegistryRoutes);
  await app.register(geoRoutes);
  await app.register(notificationRoutes);
  await app.register(systemRoutes);
  await app.register(pushRoutes);
  await app.register(klopRoutes);
  await app.register(elearningRoutes);
  await app.register(talkshowRoutes);
  await app.register(jurnalRoutes);
  await app.register(komunitasRoutes);
  await app.register(kinerjaRoutes);
  await app.register(kinerjaExtRoutes);
  await app.register(finalBatchRoutes);
  await app.register(pembinaanRoutes);
  await app.register(forumRoutes);

  try {
    await app.listen({ port: 4000, host: '0.0.0.0' });
    console.log('Central Server running on :4000');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }

  initWebSocket(app.server);
  startCentralWorker();
}

bootstrap();