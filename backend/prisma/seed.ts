// prisma/seed.ts
import 'dotenv/config';
import { prisma } from '../src/config/db.ts';
import { UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

async function main() {
  const password = 'password';
  const hashedPassword = await bcrypt.hash(password, 10);

  const users = [
    {
      firstName: 'Admin',
      lastName: 'User',
      email: process.env.ADMIN_EMAIL || 'admin@gmail.com',
      role: UserRole.ADMIN,
    },
    {
      firstName: 'Teacher',
      lastName: 'User',
      email: process.env.TEACHER_EMAIL || 'teacher@gmail.com',
      role: UserRole.TEACHER,
    },
    {
      firstName: 'Student',
      lastName: 'User',
      email: process.env.STUDENT_EMAIL || 'student@gmail.com',
      role: UserRole.STUDENT,
    },
    {
      firstName: 'Guardian',
      lastName: 'User',
      email: process.env.GUARDIAN_EMAIL || 'guardian@gmail.com',
      role: UserRole.GUARDIAN,
    },
  ];

  for (const u of users) {
    // Upsert user
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, password: hashedPassword },
    });

    // Create role-specific profile if needed
    switch (u.role) {
      case UserRole.STUDENT:
        await prisma.student.upsert({
          where: { userId: user.id },
          update: {},
          create: {
            userId: user.id,
            studentNumber: `STU${String(1).padStart(6, '0')}`, // or any unique number
            dateOfBirth: new Date('2000-01-01'), // default DOB
          },
        });
        break;

      case UserRole.TEACHER:
        await prisma.teacher.upsert({
          where: { userId: user.id },
          update: {},
          create: { userId: user.id },
        });
        break;
      case UserRole.GUARDIAN:
        await prisma.guardian.upsert({
          where: { userId: user.id },
          update: {},
          create: { userId: user.id },
        });
        break;
    }

    console.log(`${u.role} created or already exists:`, user.email);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
