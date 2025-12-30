import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/db.js";

export const ClassController = {
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, level, capacity, startDate, endDate, subjectId } = req.body;
            const newClass = await prisma.class.create({
                data: { name, level, capacity, startDate: new Date(startDate), endDate: endDate ? new Date(endDate) : null },
            });
            res.status(201).json({ message: "Class created", newClass });
        } catch (error) {
            next(error);
        }
    },

    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const classes = await prisma.class.findMany();
            res.status(200).json({ classes, message: "Classes retrieved successfully" });
        } catch (error) {
            next(error);
        }
    },

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const _class = await prisma.class.findUnique({ where: { id } });
            if (!_class) throw Object.assign(new Error("Not found"), { statusCode: 404 });
            res.status(200).json({ _class, message: "Class retrieved successfully" });
        } catch (error) {
            next(error);
        }
    },

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { name, level, capacity, startDate, endDate, subjectId } = req.body;
            const updatedClass = await prisma.class.update({
                where: { id },
                data: { name, level, capacity, startDate: new Date(startDate), endDate: endDate ? new Date(endDate) : null },
            });
            res.status(200).json({ message: "Class updated successfully", updatedClass });
        } catch (error) {
            next(error);
        }
    },

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            await prisma.class.delete({ where: { id } });
            res.status(200).json({ message: "Class deleted successfully" });
        } catch (error) {
            next(error);
        }
    },
};