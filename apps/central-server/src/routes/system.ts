import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { getStats as getWsStats } from '../websocket';

const prisma = new PrismaClient();

const PORT_MAP: Record<string, number> = {
  'sumatera': 4001, 'jawa': 4002, 'kalimantan': 4003, 'bali-nusra': 4004,
  'sulawesi': 4005, 'maluku': 4006, 'papua': 4007,
};

const REGION_META: Record<string, { flag: string; label: string }> = {
  'sumatera':   { flag: '🌴', label: 'Sumatera' },
  'jawa':       { flag: '🏙️', label: 'Jawa' },
  'kalimantan': { flag: '🌳', label: 'Kalimantan' },
  'bali-nusra': { flag: '🏖️', label: 'Bali-Nusra' },
  'sulawesi':   { flag: '🦋', label: 'Sulawesi' },
  'maluku':     { flag: '🐚', label: 'Maluku' },
  'papua':      { flag: '🐦', label: 'Papua' },
};

export default async function systemRoutes(app: FastifyInstance) {
  app.get('/api/system/health', { preValidation: [authenticate] }, async () => {
    const t0 = Date.now();

    // 1. PostgreSQL ping
    let dbOk = false, dbLatency = 0;
    try {
      const d0 = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      dbLatency = Date.now() - d0;
      dbOk = true;
    } catch { dbOk = false; }

    // 2. Edge nodes
    const edgeResults = await Promise.all(
      Object.entries(PORT_MAP).map(async ([region, port]) => {
        const e0 = Date.now();
        try {
          const res = await fetch(`http://localhost:${port}/api/health`, { signal: AbortSignal.timeout(1500) });
          const data = await res.json();
          return {
            region, port, ok: res.ok, latency: Date.now() - e0,
            fingerprint: data.fingerprint, flag: REGION_META[region]?.flag, label: REGION_META[region]?.label,
          };
        } catch {
          return { region, port, ok: false, latency: -1, flag: REGION_META[region]?.flag, label: REGION_META[region]?.label };
        }
      })
    );

    // 3. DB stats
    const [userCount, usulanCount, pelatihanCount, edgeCount, pendingApprovals] = await Promise.all([
      prisma.user.count(),
      prisma.usulan.count(),
      prisma.pelatihan.count(),
      prisma.edgeNode.count(),
      prisma.approval.count({ where: { status: 'menunggu' } }),
    ]);

    // 4. WebSocket
    const wsStats = getWsStats();

    return {
      timestamp: new Date().toISOString(),
      totalLatencyMs: Date.now() - t0,
      central: { ok: true, port: 4000, uptime: process.uptime() },
      database: { ok: dbOk, latency: dbLatency, provider: 'PostgreSQL 15' },
      websocket: wsStats,
      edges: {
        online: edgeResults.filter((e) => e.ok).length,
        total: edgeResults.length,
        list: edgeResults.sort((a, b) => a.port - b.port),
      },
      stats: { userCount, usulanCount, pelatihanCount, edgeCount, pendingApprovals },
    };
  });

  // Detail tentang sistem (public)
  app.get('/api/system/about', async () => ({
    name: 'DwagonMiniUp',
    version: '1.0.0',
    description: 'Sistem Hybrid Edge Deployment untuk Layanan Kepegawaian Indonesia',
    architecture: 'Central + 7 Edge Node + Redis Cache + PostgreSQL Master',
    features: [
      '7 Region Coverage (38 Provinsi)',
      'Hybrid Edge Deployment dengan Auto-Failover',
      'Crypto Signing Ed25519 (anti-spoofing)',
      'Geo Auto-Routing (IP + Profile)',
      'Real-time WebSocket Notification',
      'Multi-Role Approval Workflow',
      'BullMQ Async Sync',
      'JWT Authentication + bcrypt',
    ],
    tech: {
      backend: 'Node.js + Fastify + Prisma',
      frontend: 'React 18 + Vite + TailwindCSS',
      database: 'PostgreSQL 15',
      cache: 'Redis 7',
      queue: 'BullMQ',
      websocket: 'Socket.io',
      crypto: 'Ed25519 (tweetnacl)',
    },
    region: [
      { name: 'Sumatera', port: 4001, provinces: 10, capital: 'Medan' },
      { name: 'Jawa', port: 4002, provinces: 6, capital: 'Jakarta' },
      { name: 'Kalimantan', port: 4003, provinces: 5, capital: 'Balikpapan' },
      { name: 'Bali-Nusra', port: 4004, provinces: 3, capital: 'Denpasar' },
      { name: 'Sulawesi', port: 4005, provinces: 6, capital: 'Makassar' },
      { name: 'Maluku', port: 4006, provinces: 2, capital: 'Ambon' },
      { name: 'Papua', port: 4007, provinces: 6, capital: 'Jayapura' },
    ],
  }));
}