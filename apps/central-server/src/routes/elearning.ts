import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const prisma = new PrismaClient();

export default async function elearningRoutes(app: FastifyInstance) {
  // ===== Categories =====
  app.get('/api/elearning/categories', async () => {
    const cats = await prisma.elearningCategory.findMany({
      orderBy: { order: 'asc' },
      include: { _count: { select: { courses: true } } },
    });
    return cats.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      icon: c.icon,
      courseCount: c._count.courses,
    }));
  });

  // ===== Course list (filters + sort) =====
  app.get('/api/elearning/courses', { preValidation: [authenticate] }, async (req: any) => {
    const { sub: userId } = req.user;
    const {
      q, category, status, accessType, year, penyelenggara, sort = 'recent',
      limit = '24', offset = '0', tab = 'elearning',
    } = req.query as Record<string, string>;

    const where: any = {};
    if (category && category !== 'all') where.category = { slug: category };
    if (status && status !== 'Semua') where.status = status;
    if (accessType && accessType !== 'Semua') where.accessType = accessType;
    if (year && year !== 'Semua') where.year = Number(year);
    if (penyelenggara) where.penyelenggara = { contains: penyelenggara, mode: 'insensitive' };
    if (q && q.trim()) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    // Tab "Pelatihanku" → hanya course yang sudah di-enroll user
    if (tab === 'pelatihanku') {
      where.enrollments = { some: { userId } };
    }

    const orderBy: any = (() => {
      switch (sort) {
        case 'popular': return [{ enrolled: 'desc' }];
        case 'rating':  return [{ rating: 'desc' }];
        case 'recent':
        default:        return [{ startDate: 'desc' }];
      }
    })();

    const [courses, total] = await Promise.all([
      prisma.elearningCourse.findMany({
        where,
        orderBy,
        take: Math.min(Number(limit), 100),
        skip: Number(offset),
        include: {
          category: { select: { slug: true, name: true, icon: true } },
          enrollments: { where: { userId }, select: { id: true, progress: true, status: true, hasCert: true } },
        },
      }),
      prisma.elearningCourse.count({ where }),
    ]);

    return {
      items: courses.map((c) => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        description: c.description,
        type: c.type,
        accessType: c.accessType,
        status: c.status,
        poster: c.poster,
        penyelenggara: c.penyelenggara,
        totalJP: c.totalJP,
        totalHours: c.totalHours,
        startDate: c.startDate,
        endDate: c.endDate,
        year: c.year,
        kuota: c.kuota,
        enrolled: c.enrolled,
        rating: c.rating,
        category: c.category,
        isEnrolled: c.enrollments.length > 0,
        userProgress: c.enrollments[0]?.progress ?? 0,
        hasCert: c.enrollments[0]?.hasCert ?? false,
      })),
      total,
      limit: Number(limit),
      offset: Number(offset),
    };
  });

  // ===== Stats per status =====
  app.get('/api/elearning/stats', { preValidation: [authenticate] }, async (req: any) => {
    const { sub: userId } = req.user;
    const { tab = 'elearning' } = req.query as { tab?: string };

    const baseWhere: any = tab === 'pelatihanku' ? { enrollments: { some: { userId } } } : {};

    const [all, dibuka, dimulai, akanDatang, sudahBerakhir, terbuka, pengajuan, undangan] = await Promise.all([
      prisma.elearningCourse.count({ where: baseWhere }),
      prisma.elearningCourse.count({ where: { ...baseWhere, status: 'Dibuka' } }),
      prisma.elearningCourse.count({ where: { ...baseWhere, status: 'Dimulai' } }),
      prisma.elearningCourse.count({ where: { ...baseWhere, status: 'Akan Datang' } }),
      prisma.elearningCourse.count({ where: { ...baseWhere, status: 'Sudah Berakhir' } }),
      prisma.elearningCourse.count({ where: { ...baseWhere, accessType: 'Terbuka' } }),
      prisma.elearningCourse.count({ where: { ...baseWhere, accessType: 'Pengajuan' } }),
      prisma.elearningCourse.count({ where: { ...baseWhere, accessType: 'Undangan' } }),
    ]);

    return {
      total: all,
      byStatus: { Dibuka: dibuka, Dimulai: dimulai, 'Akan Datang': akanDatang, 'Sudah Berakhir': sudahBerakhir },
      byAccess: { Terbuka: terbuka, Pengajuan: pengajuan, Undangan: undangan },
    };
  });

  // ===== Years available =====
  app.get('/api/elearning/years', async () => {
    const years = await prisma.elearningCourse.findMany({
      select: { year: true },
      distinct: ['year'],
      orderBy: { year: 'desc' },
    });
    return years.map((y) => y.year);
  });

  // ===== Detail =====
  app.get('/api/elearning/courses/:id', { preValidation: [authenticate] }, async (req: any, reply) => {
    const { sub: userId } = req.user;
    const { id } = req.params as { id: string };

    const course = await prisma.elearningCourse.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        category: { select: { slug: true, name: true, icon: true } },
        enrollments: { where: { userId }, select: { id: true, progress: true, status: true, hasCert: true, score: true } },
      },
    });

    if (!course) return reply.code(404).send({ error: 'Course tidak ditemukan' });

    return {
      ...course,
      isEnrolled: course.enrollments.length > 0,
      userProgress: course.enrollments[0]?.progress ?? 0,
      hasCert: course.enrollments[0]?.hasCert ?? false,
      userScore: course.enrollments[0]?.score ?? null,
    };
  });

  // ===== Enroll =====
  app.post('/api/elearning/courses/:id/enroll', { preValidation: [authenticate] }, async (req: any, reply) => {
    const { sub: userId } = req.user;
    const { id } = req.params as { id: string };

    const course = await prisma.elearningCourse.findUnique({ where: { id } });
    if (!course) return reply.code(404).send({ error: 'Course tidak ditemukan' });

    const existing = await prisma.elearningEnrollment.findUnique({
      where: { courseId_userId: { courseId: id, userId } },
    });
    if (existing) return reply.code(409).send({ error: 'Sudah terdaftar di course ini' });

    const enrollment = await prisma.elearningEnrollment.create({
      data: { courseId: id, userId, progress: 0, status: 'aktif' },
    });

    await prisma.elearningCourse.update({
      where: { id },
      data: { enrolled: { increment: 1 } },
    });

    return enrollment;
  });

  // ===== Update progress =====
  app.patch('/api/elearning/enrollments/:id/progress', { preValidation: [authenticate] }, async (req: any, reply) => {
    const { sub: userId } = req.user;
    const { id } = req.params as { id: string };
    const { progress } = req.body as { progress: number };

    const enr = await prisma.elearningEnrollment.findFirst({ where: { id, userId } });
    if (!enr) return reply.code(404).send({ error: 'Enrollment tidak ditemukan' });

    const clampedProgress = Math.max(0, Math.min(100, Math.round(progress)));
    const updates: any = { progress: clampedProgress };

    if (clampedProgress === 100 && enr.status !== 'selesai') {
      updates.status = 'selesai';
      updates.hasCert = true;
      updates.completedAt = new Date();
      updates.score = 85 + Math.random() * 12;
    }

    return prisma.elearningEnrollment.update({ where: { id }, data: updates });
  });

  // ===== My Courses (Pelatihanku) =====
  app.get('/api/elearning/my-courses', { preValidation: [authenticate] }, async (req: any) => {
    const { sub: userId } = req.user;
    const enrollments = await prisma.elearningEnrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: { category: { select: { slug: true, name: true, icon: true } } },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });
    return enrollments;
  });
}