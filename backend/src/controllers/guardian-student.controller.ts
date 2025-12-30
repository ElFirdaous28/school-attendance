import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/db.js";

export const GuardianStudentController = {
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { guardianId, studentId, relationType, isPrimary } = req.body;

            const guardianStudent = await prisma.guardianStudent.create({
                data: { guardianId, studentId, relationType, isPrimary },
            });

            res.status(201).json({ message: "GuardianStudent created", guardianStudent });
        } catch (error) {
            next(error);
        }
    },

    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const guardianStudents = await prisma.guardianStudent.findMany();
            res.status(200).json({ guardianStudents, message: "GuardianStudents retrieved successfully" });
        } catch (error) {
            next(error);
        }
    },

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const guardianStudent = await prisma.guardianStudent.findUnique({ where: { id } });
            if (!guardianStudent) throw Object.assign(new Error("Not found"), { statusCode: 404 });
            res.status(200).json({ guardianStudent, message: "GuardianStudent retrieved successfully" });
        } catch (error) {
            next(error);
        }
    },

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            await prisma.guardianStudent.delete({ where: { id } });
            res.status(200).json({ message: "GuardianStudent deleted successfully" });
        } catch (error) {
            next(error);
        }
    },
};