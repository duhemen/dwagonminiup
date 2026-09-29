const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

(async () => {
  const [kc, ki, ec, eco, eenr, u, en, us] = await Promise.all([
    p.knowledgeCategory.count(),
    p.knowledgeItem.count(),
    p.elearningCategory.count(),
    p.elearningCourse.count(),
    p.elearningEnrollment.count(),
    p.user.count(),
    p.edgeNode.count(),
    p.usulan.count(),
  ]);

  console.log('KnowledgeCategory   :', kc);
  console.log('KnowledgeItem       :', ki);
  console.log('ElearningCategory   :', ec);
  console.log('ElearningCourse     :', eco);
  console.log('ElearningEnrollment :', eenr);
  console.log('User                :', u);
  console.log('EdgeNode            :', en);
  console.log('Usulan              :', us);

  await p.$disconnect();
  process.exit(0);
})();