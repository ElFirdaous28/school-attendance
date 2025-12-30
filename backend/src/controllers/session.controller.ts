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
            const sessions = await prisma.session.findMany({
                include: {
                    class: true,
                    teacher: true,
                    attendances: true,
                },
            });

            res.status(200).json({ sessions, message: 'Sessions retrieved successfully' });
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
