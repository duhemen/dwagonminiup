import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { authenticate } from '../middleware/auth';
import { detectRegionFromIP, isValidRegion, getFallbacks } from '../geo/detect-region';
import { logActivity } from '../services/notification-service';

const prisma = new PrismaClient();

export default async function authRoutes(app: FastifyInstance) {
  app.post('/api/auth/login', async (req: any, reply) => {
    const { email, password } = req.body as { email: string; password: string };
    const { simulate_region } = req.query as { simulate_region?: string };

    if (!email || !password) return reply.code(400).send({ error: 'Email dan password wajib diisi' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return reply.code(401).send({ error: 'Email atau password salah' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return reply.code(401).send({ error: 'Email atau password salah' });

    const ip = (req.ip || req.headers['x-forwarded-for'] as string || '').split(',')[0].trim();
    const ua = (req.headers['user-agent'] as string) || '';
    let assignedRegion = user.assignedRegion;
    let regionSource = 'assigned';
    let regionLocked = user.regionLocked;

    if (simulate_region && isValidRegion(simulate_region)) {
      assignedRegion = simulate_region; regionSource = 'simulate';
    } else if (user.regionLocked && user.assignedRegion) {
      assignedRegion = user.assignedRegion; regionSource = 'locked';
    } else if (assignedRegion) {
      regionSource = 'assigned';
    } else if (user.region && isValidRegion(user.region)) {
      assignedRegion = user.region; regionSource = 'profile';
    } else {
      const detected = detectRegionFromIP(ip);
      if (detected) { assignedRegion = detected; regionSource = 'ip'; }
      else { assignedRegion = 'jawa'; regionSource = 'default'; }
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { assignedRegion, lastIP: ip, lastLoginAt: new Date() },
    });

    // Log activity
    await logActivity({
      userId: user.id, action: 'login',
      targetType: 'user', targetId: user.id,
      meta: { region: assignedRegion, source: regionSource },
      ip, userAgent: ua,
    });

    const token = app.jwt.sign({ sub: user.id, email: user.email, role: user.role });

    return {
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      region: assignedRegion, regionSource, regionLocked, ip,
      fallbacks: getFallbacks(assignedRegion as any),
    };
  });

  app.get('/api/auth/me', { preValidation: [authenticate] }, async (req, reply) => {
    const { sub } = req.user as { sub: string };
    const user = await prisma.user.findUnique({
      where: { id: sub },
      select: {
        id: true, email: true, name: true, nip: true,
        jabatan: true, unitKerja: true, pendidikan: true,
        role: true, region: true, assignedRegion: true, regionLocked: true,
        lastIP: true, lastLoginAt: true, createdAt: true,
      },
    });
    if (!user) return reply.code(404).send({ error: 'User tidak ditemukan' });
    return user;
  });

  app.post('/api/auth/change-password', { preValidation: [authenticate] }, async (req: any, reply) => {
    const { sub: userId } = req.user as { sub: string };
    const { oldPassword, newPassword } = req.body as { oldPassword: string; newPassword: string };
    if (!oldPassword || !newPassword) return reply.code(400).send({ error: 'Wajib diisi' });
    if (newPassword.length < 6) return reply.code(400).send({ error: 'Minimal 6 karakter' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return reply.code(404).send({ error: 'User tidak ditemukan' });
    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) return reply.code(400).send({ error: 'Password lama salah' });
    if (oldPassword === newPassword) return reply.code(400).send({ error: 'Harus berbeda' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: userId }, data: { password: hashed } });

    await logActivity({ userId, action: 'change_password', targetType: 'user', targetId: userId });

    return { ok: true, message: 'Password berhasil diubah' };
  });
}