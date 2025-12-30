import { Request, Response, NextFunction } from 'express';
import { prisma } from "../config/db.js";

export const StudentClassController = {
    // Enroll a student in a class
    async enrollStudentInClass(req: Request, res: Response, next: NextFunction) {
        try {
            const { studentId, classId } = req.body;

            const enrollment = await prisma.studentClass.create({
                data: { studentId, classId },
            });

            res.status(201).json({
                message: 'Student successfully enrolled in class',
                enrollment,
            });
        } catch (error) {
            next(error);
        }
    },

    // update enrolement details
    async updateEnrollment(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { studentId, classId } = req.body;
            const updatedEnrollment = await prisma.studentClass.update({
                where: { id },
                data: { studentId, classId },
            });
            res.status(200).json({
                message: 'Enrollment updated successfully',
                enrollment: updatedEnrollment,
            });
        } catch (error) {
            next(error);
        }
    },

    // Remove a student from a class
    async removeStudentFromClass(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            await prisma.studentClass.delete({ where: { id } });
            res.status(200).json({ message: 'Student removed from class successfully' });
        } catch (error) {
            next(error);
        }
    },

    // Get all classes a specific student is enrolled in
    async getClassesForStudent(req: Request, res: Response, next: NextFunction) {
        try {
            const { studentId } = req.params;

            const classes = await prisma.studentClass.findMany({
                where: { studentId },
                include: { class: true },
            });

            res.status(200).json({
                message: `Classes retrieved for student ${studentId}`,
                classes,
            });
        } catch (error) {
            next(error);
        }
    },

    // Get all students in a specific class
    async getStudentsInClass(req: Request, res: Response, next: NextFunction) {
        try {
            const { classId } = req.params;

            const students = await prisma.studentClass.findMany({
                where: { classId },
                // with user details
                include: { student: { include: { user: true } }, },
            });

            res.status(200).json({
                message: `Students retrieved for class ${classId}`,
                students,
            });
        } catch (error) {
            next(error);
        }
    },
};
