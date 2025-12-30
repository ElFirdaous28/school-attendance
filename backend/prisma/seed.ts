import 'dotenv/config';
import { prisma } from '../src/config/db.ts';
import { UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@gmail.com';

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log('Admin already exists:', existingAdmin.email);
    process.exit(0); // Not an error, script can exit normally
  }

  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'password', 10);

  const admin = await prisma.user.create({
    data: {
      firstName: 'Admin',
      lastName: 'User',
      email: adminEmail,
      password: hashedPassword,
      role: UserRole.ADMIN,
    },
  });

  console.log('Admin created:', admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1); // exit with error if something went wrong
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
