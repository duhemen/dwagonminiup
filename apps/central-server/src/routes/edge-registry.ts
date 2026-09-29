import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const prisma = new PrismaClient();

export default async function edgeRegistryRoutes(app: FastifyInstance) {
  // Register edge (public endpoint, no auth — edge register on startup)
  app.post('/api/edge-registry/register', async (req, reply) => {
    const { region, publicKey, fingerprint, endpoint } = req.body as {
      region: string;
      publicKey: string;
      fingerprint: string;
      endpoint?: string;
    };

    if (!region || !publicKey || !fingerprint) {
      return reply.code(400).send({ error: 'region, publicKey, fingerprint wajib' });
    }

    const node = await prisma.edgeNode.upsert({
      where: { region },
      update: {
        publicKey,
        fingerprint,
        endpoint,
        lastHeartbeat: new Date(),
        status: 'active',
      },
      create: {
        region,
        publicKey,
        fingerprint,
        endpoint,
        status: 'active',
      },
    });

    return {
      ok: true,
      region: node.region,
      fingerprint: node.fingerprint,
      registeredAt: node.registeredAt,
    };
  });

  // Heartbeat
  app.post('/api/edge-registry/heartbeat', async (req) => {
    const { region } = req.body as { region: string };
    if (!region) return { ok: false };
    await prisma.edgeNode.update({
      where: { region },
      data: { lastHeartbeat: new Date(), status: 'active' },
    });
    return { ok: true };
  });

  // List all registered edges (protected)
  app.get('/api/edge-registry', { preValidation: [authenticate] }, async () => {
    const edges = await prisma.edgeNode.findMany({ orderBy: { region: 'asc' } });
    const now = Date.now();
    return edges.map((e) => {
      const diff = now - e.lastHeartbeat.getTime();
      const isOnline = diff < 60000; // 60 detik
      return { ...e, isOnline };
    });
  });

  // Get specific edge
  app.get('/api/edge-registry/:region', { preValidation: [authenticate] }, async (req, reply) => {
    const { region } = req.params as { region: string };
    const edge = await prisma.edgeNode.findUnique({ where: { region } });
    if (!edge) return reply.code(404).send({ error: 'Edge tidak terdaftar' });
    return edge;
  });
}