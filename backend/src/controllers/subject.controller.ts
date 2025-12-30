import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/db.js";

export const SubjectController = {
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, code, description } = req.body;
            const subject = await prisma.subject.create({ data: { name, code, description } });
            res.status(201).json({ message: "Subject created", subject });
        } catch (error) {
            next(error);
        }
    },

    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const subjects = await prisma.subject.findMany();
            res.status(200).json({ subjects, message: "Subjects retrieved successfully" });
        } catch (error) {
            next(error);
        }
    },

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const subject = await prisma.subject.findUnique({ where: { id } });
            if (!subject) throw Object.assign(new Error("Not found"), { statusCode: 404 });
            res.status(200).json({ subject, message: "Subject retrieved successfully" });
        } catch (error) {
            next(error);
        }
    },

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { name, code, description } = req.body;
            const subject = await prisma.subject.update({
                where: { id },
                data: { name, code, description },
            });
            res.status(200).json({ message: "Subject updated successfully", subject });
        } catch (error) {
            next(error);
        }
    },

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            await prisma.subject.delete({ where: { id } });
            res.status(200).json({ message: "Subject deleted successfully" });
        } catch (error) {
            next(error);
        }
    },
};