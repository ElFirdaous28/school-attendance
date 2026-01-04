import 'dotenv/config';
import { prisma } from '../../src/config/db.ts';

async function main() {
    console.log('📅 Seeding sessions...');

    // Fetch classes and teachers first
    const classes = await prisma.class.findMany();
    const teachers = await prisma.teacher.findMany();

    if (!classes.length || !teachers.length) {
        console.log('❌ Please seed classes and teachers first');
        return;
    }

    const sessionsData = [
        {
            classIndex: 0,
            teacherIndex: 0,
            date: new Date('2025-01-15T09:00:00'),
            startTime: new Date('2025-01-15T09:00:00'),
            endTime: new Date('2025-01-15T10:30:00'),
            status: 'VALIDATED',
        },
        {
            classIndex: 1,
            teacherIndex: 1,
            date: new Date('2025-01-16T11:00:00'),
            startTime: new Date('2025-01-16T11:00:00'),
            endTime: new Date('2025-01-16T12:30:00'),
            status: 'DRAFT',
        },
        {
            classIndex: 2,
            teacherIndex: 0,
            date: new Date('2025-01-17T13:00:00'),
            startTime: new Date('2025-01-17T13:00:00'),
            endTime: new Date('2025-01-17T14:30:00'),
            status: 'VALIDATED',
        },
    ];

    for (const s of sessionsData) {
        const cls = classes[s.classIndex];
        const teacher = teachers[s.teacherIndex];

        await prisma.session.create({
            data: {
                classId: cls.id,
                teacherId: teacher.id,
                date: s.date,
                startTime: s.startTime,
                endTime: s.endTime,
                status: s.status as any,
            },
        });

        console.log(`✅ Session created for class: ${cls.name}, teacher: ${teacher.userId}`);
    }

    console.log('🎉 Sessions seeding completed');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
