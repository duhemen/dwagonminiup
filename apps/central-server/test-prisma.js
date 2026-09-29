const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

(async () => {
  console.log('User:', typeof p.user);
  console.log('ElearningCategory:', typeof p.elearningCategory);
  console.log('ElearningCourse:', typeof p.elearningCourse);
  console.log('ElearningEnrollment:', typeof p.elearningEnrollment);
  console.log('KnowledgeItem:', typeof p.knowledgeItem);
  console.log('ActivityLog:', typeof p.activityLog);

  // Coba query 1 user untuk test koneksi
  try {
    const userCount = await p.user.count();
    console.log('\n✅ Koneksi DB OK. User count:', userCount);
  } catch (e) {
    console.log('\n❌ DB query error:', e.message);
  }

  await p.$disconnect();
  process.exit(0);
})();