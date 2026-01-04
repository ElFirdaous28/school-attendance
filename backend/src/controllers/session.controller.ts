import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';

export const SessionController = {
    async createSession(req: Request, res: Response, next: NextFunction) {
        try {
            const { classId, teacherId, date, startTime, endTime } = req.body;

            const session = await prisma.session.create({
                data: { classId, teacherId, date: new Date(date), startTime: new Date(startTime), endTime: new Date(endTime) },
            });

            res.status(201).json({ message: 'Session created successfully', session });
        } catch (error) {
            next(error);
        }
    },

    async updateSession(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { classId, teacherId, date, startTime, endTime, status } = req.body;
            const updatedSession = await prisma.session.update({
                where: { id },
                data: { classId, teacherId, date, startTime, endTime, status },
            });
            res.status(200).json({
                message: 'Session updated successfully',
                session: updatedSession,
            });
        } catch (error) {
            next(error);
        }
    },

    async getSessions(req: Request, res: Response, next: NextFunction) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const skip = (page - 1) * limit;

            const search = (req.query.search as string)?.trim(); // search by class name
            const status = (req.query.status as string)?.toUpperCase(); // DRAFT | VALIDATED
            const teacherId = req.query.teacherId as string; // optional filter by teacher

            const where: any = {};

            if (search) {
                where.class = {
                    name: { contains: search, mode: 'insensitive' },
                };
            }

            if (status && ['DRAFT', 'VALIDATED'].includes(status)) {
                where.status = status;
            }

            if (teacherId) {
                where.teacherId = teacherId;
            }

            const [sessions, total] = await Promise.all([
                prisma.session.findMany({
                    skip,
                    take: limit,
                    where,
                    include: {
                        class: true,
                        teacher: true,
                        attendances: true,
                    },
                    orderBy: { date: 'desc' },
                }),
                prisma.session.count({ where }),
            ]);

            res.status(200).json({
                message: 'Sessions retrieved successfully',
                sessions,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            });
        } catch (error) {
            next(error);
        }
    },
    
    async getSessionById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            const session = await prisma.session.findUnique({
                where: { id },
                include: { class: true, teacher: true, attendances: true },
            });

            if (!session) throw Object.assign(new Error('Not found'), { statusCode: 404 });

            res.status(200).json({ session, message: 'Session retrieved successfully' });
        } catch (error) {
            next(error);
        }
    },

    async deleteSession(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            await prisma.session.delete({ where: { id } });
            res.status(200).json({ message: 'Session deleted successfully' });
        } catch (error) {
            next(error);
        }
    },
};
