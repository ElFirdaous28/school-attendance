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
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const skip = (page - 1) * limit;

            const search = (req.query.search as string)?.trim(); // name / level
            const status = (req.query.status as string)?.toUpperCase(); // ACTIVE | FINISHED

            const where: any = {};

            // Search by name or level
            if (search) {
                where.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { level: { contains: search, mode: 'insensitive' } },
                ];
            }

            // Filter by status
            if (status && ['ACTIVE', 'FINISHED'].includes(status)) {
                where.status = status;
            }

            const [classes, total] = await Promise.all([
                prisma.class.findMany({
                    skip,
                    take: limit,
                    where,
                    orderBy: { createdAt: 'desc' },
                }),
                prisma.class.count({ where }),
            ]);

            res.status(200).json({
                message: "Classes retrieved successfully",
                classes,
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