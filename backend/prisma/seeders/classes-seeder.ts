import 'dotenv/config';
import { prisma } from '../../src/config/db.ts';

async function main() {
    console.log('Seeding classes...');

    const classes = [
        {
            name: 'Math 101',
            level: 'Beginner',
            capacity: 30,
            startDate: new Date('2025-01-10'),
        },
        {
            name: 'Physics 201',
            level: 'Intermediate',
            capacity: 25,
            startDate: new Date('2025-02-01'),
        },
        {
            name: 'Chemistry 301',
            level: 'Advanced',
            capacity: 20,
            startDate: new Date('2025-03-01'),
        },
    ];

    for (const cls of classes) {
        await prisma.class.create({
            data: cls,
        });

        console.log(`✅ Class created: ${cls.name}`);
    }

    console.log('🎉 Classes seeding completed');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
