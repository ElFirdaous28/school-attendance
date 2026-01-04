import 'dotenv/config';
import { prisma } from '../../src/config/db.ts';

async function main() {
  console.log('📝 Seeding student enrollments...');

  const students = await prisma.student.findMany();
  const classes = await prisma.class.findMany();

  if (!students.length || !classes.length) {
    console.log('❌ Please seed students and classes first');
    return;
  }

  const enrollmentStatus = ['ACTIVE', 'ENROLLED_LATE', 'DROPPED', 'COMPLETED'] as const;

  const enrollments: any[] = [];

  // Simple logic: assign each student to 2 classes randomly
  for (const student of students) {
    const shuffledClasses = classes.sort(() => Math.random() - 0.5).slice(0, 2);

    for (const cls of shuffledClasses) {
      enrollments.push({
        studentId: student.id,
        classId: cls.id,
        enrolledAt: new Date(),
        status: enrollmentStatus[Math.floor(Math.random() * enrollmentStatus.length)],
        notes: 'Auto-generated enrollment',
      });
    }
  }

  for (const e of enrollments) {
    // use upsert to avoid duplicates
    await prisma.studentClass.upsert({
      where: {
        studentId_classId: {
          studentId: e.studentId,
          classId: e.classId,
        },
      },
      update: {},
      create: e,
    });

    console.log(`✅ Student ${e.studentId} enrolled in class ${e.classId}`);
  }

  console.log('🎉 Enrollments seeding completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
