import 'dotenv/config';
import { prisma } from '../../src/config/db.ts';

async function main() {
    console.log('📚 Seeding subjects...');

    const subjects = [
        { name: 'Mathematics', code: 'MATH101', description: 'Basic Math' },
        { name: 'Physics', code: 'PHY101', description: 'Introduction to Physics' },
        { name: 'Chemistry', code: 'CHEM101', description: 'Basic Chemistry' },
        { name: 'Biology', code: 'BIO101', description: 'Introduction to Biology' },
        { name: 'English', code: 'ENG101', description: 'English Language' },
        { name: 'History', code: 'HIS101', description: 'World History' },
        { name: 'Geography', code: 'GEO101', description: 'Physical and Human Geography' },
    ];

    for (const sub of subjects) {
        await prisma.subject.upsert({
            where: { code: sub.code }, // avoid duplicates
            update: {},
            create: sub,
        });

        console.log(`✅ Subject created: ${sub.name}`);
    }

    console.log('🎉 Subjects seeding completed');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
