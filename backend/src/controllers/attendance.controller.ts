import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';

export const AttendanceController = {
    async markAttendance(req: Request, res: Response, next: NextFunction) {
        try {
            const { sessionId, studentId, status, notes } = req.body;

            const attendance = await prisma.attendance.create({
                data: { sessionId, studentId, status, notes },
            });

            res.status(201).json({ message: 'Attendance marked', attendance });
        } catch (error) {
            next(error);
        }
    },

    async getAttendanceBySession(req: Request, res: Response, next: NextFunction) {
        try {
            const { sessionId } = req.params;

            const attendances = await prisma.attendance.findMany({
                where: { sessionId },
                include: { student: { include: { user: true } } },
            });

            res.status(200).json({ attendances });
        } catch (error) {
            next(error);
        }
    },

    async getAttendanceByStudent(req: Request, res: Response, next: NextFunction) {
        try {
            const { studentId } = req.params;

            const attendances = await prisma.attendance.findMany({
                where: { studentId },
                include: { session: true },
            });

            res.status(200).json({ attendances });
        } catch (error) {
            next(error);
        }
    },

    async updateAttendance(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { status, notes } = req.body;

            const attendance = await prisma.attendance.update({
                where: { id },
                data: { status, notes },
            });

            res.status(200).json({ message: 'Attendance updated', attendance });
        } catch (error) {
            next(error);
        }
    },

    async deleteAttendance(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            await prisma.attendance.delete({ where: { id } });
            res.status(200).json({ message: 'Attendance deleted' });
        } catch (error) {
            next(error);
        }
    },
};
