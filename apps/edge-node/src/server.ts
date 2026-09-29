import Fastify from 'fastify';
import jwt from '@fastify/jwt';
import { redis } from './queue';
import { startEdgeWorker } from './queue/worker';
import usulanEdgeRoutes from './routes/usulan-edge';
import { getOrCreateKeypair } from './crypto/keypair';
import { registerEdgeWithCentral, startHeartbeat } from './crypto/register';

const app = Fastify({ logger: true });
const PORT = Number(process.env.PORT ?? 4001);
const REGION = process.env.REGION ?? 'kalimantan';

async function bootstrap() {
  await app.register(jwt, { secret: process.env.JWT_SECRET ?? 'dev-secret' });

  app.decorate('authenticate', async (req: any, reply: any) => {
    try { await req.jwtVerify(); } catch (err) { reply.send(err); }
  });

  const kp = getOrCreateKeypair(REGION);

  app.get('/api/health', async () => ({
    status: 'ok', service: 'edge-node', region: REGION, port: PORT,
    fingerprint: kp.fingerprint, timestamp: new Date().toISOString(),
  }));

  app.get('/api/identity', async () => ({
    region: REGION, port: PORT,
    publicKey: kp.publicKey, fingerprint: kp.fingerprint,
  }));

  app.get('/api/dashboard', { preValidation: [(app as any).authenticate] }, async (req: any) => {
    const user = req.user;
    const cacheKey = `dashboard:${REGION}:${user.sub}`;
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const data = {
      panels: ['KINERJA', 'E-HRD', 'AKREDITASI', 'KARIR', 'KLOP', 'KARYA'],
      autoLogin: true, email: user.email, servedBy: `edge-${REGION}`,
    };
    await redis.setex(cacheKey, 60, JSON.stringify(data));
    return data;
  });

  await app.register(usulanEdgeRoutes);
  startEdgeWorker();

  try {
    await app.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`Edge Node [${REGION}] running on :${PORT}`);
    console.log(`Crypto fingerprint: ${kp.fingerprint}`);

    setTimeout(async () => {
      await registerEdgeWithCentral();
      startHeartbeat();
    }, 2000);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

bootstrap();