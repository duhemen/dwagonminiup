import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { detectRegionFromIP, getFallbacks, isValidRegion, ALL_REGIONS } from '../geo/detect-region';

const prisma = new PrismaClient();

export default async function geoRoutes(app: FastifyInstance) {
  // POST /api/geo/detect — deteksi region + lock/unlock info
  app.post('/api/geo/detect', { preValidation: [authenticate] }, async (req: any, reply) => {
    const { sub: userId } = req.user;
    const { simulate_region } = req.query as { simulate_region?: string };
    const ip = (req.ip || req.headers['x-forwarded-for'] as string || '').split(',')[0].trim();

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return reply.code(404).send({ error: 'User tidak ditemukan' });

    let region: string;
    let source: string;
    let locked = user.regionLocked;

    if (simulate_region && isValidRegion(simulate_region)) {
      region = simulate_region; source = 'simulate'; locked = false;
    } else if (user.regionLocked && user.assignedRegion) {
      region = user.assignedRegion; source = 'locked';
    } else if (user.assignedRegion) {
      region = user.assignedRegion; source = 'assigned';
    } else if (user.region && isValidRegion(user.region)) {
      region = user.region; source = 'profile';
      await prisma.user.update({ where: { id: userId }, data: { assignedRegion: region } });
    } else {
      const detected = detectRegionFromIP(ip);
      if (detected) {
        region = detected; source = 'ip';
        await prisma.user.update({ where: { id: userId }, data: { assignedRegion: detected, lastIP: ip } });
      } else {
        region = 'jawa'; source = 'default';
      }
    }

    await prisma.user.update({ where: { id: userId }, data: { lastIP: ip, lastLoginAt: new Date() } });

    return {
      region, detected: source === 'ip', source, locked, ip,
      fallbacks: getFallbacks(region as any),
    };
  });

  // POST /api/geo/lock
  app.post('/api/geo/lock', { preValidation: [authenticate] }, async (req: any, reply) => {
    const { sub: userId } = req.user;
    const { region } = req.body as { region: string };
    if (!isValidRegion(region)) return reply.code(400).send({ error: 'Region tidak valid' });

    const user = await prisma.user.update({
      where: { id: userId },
      data: { assignedRegion: region, regionLocked: true },
    });
    return { ok: true, region: user.assignedRegion, locked: true };
  });

  // POST /api/geo/unlock
  app.post('/api/geo/unlock', { preValidation: [authenticate] }, async (req: any) => {
    const { sub: userId } = req.user;
    const user = await prisma.user.update({
      where: { id: userId },
      data: { regionLocked: false },
    });
    return { ok: true, region: user.assignedRegion, locked: false };
  });

  // GET /api/geo/regions — metadata 7 region
  app.get('/api/geo/regions', async () => ({
    total: 38,
    regions: [
      { value: 'sumatera',   label: 'Sumatera',   provinces: 10, capital: 'Medan',      port: 4001 },
      { value: 'jawa',       label: 'Jawa',       provinces: 6,  capital: 'Jakarta',    port: 4002 },
      { value: 'kalimantan', label: 'Kalimantan', provinces: 5,  capital: 'Balikpapan', port: 4003 },
      { value: 'bali-nusra', label: 'Bali-Nusra', provinces: 3,  capital: 'Denpasar',   port: 4004 },
      { value: 'sulawesi',   label: 'Sulawesi',   provinces: 6,  capital: 'Makassar',   port: 4005 },
      { value: 'maluku',     label: 'Maluku',     provinces: 2,  capital: 'Ambon',      port: 4006 },
      { value: 'papua',      label: 'Papua',      provinces: 6,  capital: 'Jayapura',   port: 4007 },
    ],
  }));

  // GET /api/geo/health — cek edge mana yang hidup (untuk failover)
  app.get('/api/geo/health', async () => {
    const PORT_MAP: Record<string, number> = {
      'sumatera': 4001, 'jawa': 4002, 'kalimantan': 4003, 'bali-nusra': 4004,
      'sulawesi': 4005, 'maluku': 4006, 'papua': 4007,
    };
    const results = await Promise.all(ALL_REGIONS.map(async (region) => {
      try {
        const res = await fetch(`http://localhost:${PORT_MAP[region]}/api/health`, {
          signal: AbortSignal.timeout(1000),
        });
        return { region, ok: res.ok, port: PORT_MAP[region] };
      } catch {
        return { region, ok: false, port: PORT_MAP[region] };
      }
    }));
    return {
      timestamp: new Date().toISOString(),
      online: results.filter((r) => r.ok).length,
      total: results.length,
      edges: results,
    };
  });
}