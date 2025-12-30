import { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { AuthPayload } from '@school/shared/src/types/express.js';
import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';
import { NextFunction } from 'express-serve-static-core';
import { sendEmail } from '../utils/mailer.js';

// Define a reusable select object to keep code DRY
const userSelect = {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    role: true,
    createdAt: true,
    teacher: true,
    student: true,
    guardian: true,
};

export const UserController = {

    async createUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { firstName, lastName, email, password, role, ...rest } = req.body;

            const hashedPassword = await bcrypt.hash(password, 10);

            const result = await prisma.$transaction(async (tx) => {
                const newUser = await tx.user.create({
                    data: { firstName, lastName, email, password: hashedPassword, role },
                    select: userSelect
                });

                switch (role) {
                    case UserRole.TEACHER:
                        await tx.teacher.create({ data: { userId: newUser.id, specialization: rest.specialization || null } });
                        break;
                    case UserRole.STUDENT:
                        const studentNumber = `STU${String(await tx.student.count() + 1).padStart(6, "0")}`;
                        await tx.student.create({ data: { userId: newUser.id, studentNumber, dateOfBirth: rest.dateOfBirth } });
                        break;
                    case UserRole.GUARDIAN:
                        await tx.guardian.create({ data: { userId: newUser.id, phoneNumber: rest.phoneNumber || null, address: rest.address || null } });
                        break;
                }

                return newUser;
            });

            // Send welcome email
            // await sendEmail(
            //     result.email,
            //     "Welcome to School App!",
            //     `<p>Hello ${result.firstName},</p>
            //  <p>Your account has been created successfully.</p>
            //  <p>Email: ${result.email}</p>`
            // );

            res.status(201).json({ message: "User created successfully", user: result });
        } catch (error) {
            next(error);
        }
    },


    async updateUser(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;
        const { firstName, lastName, email, password, ...rest } = req.body;

        try {
            // Get the current user to know their role
            const existingUser = await prisma.user.findUnique({
                where: { id },
                select: { role: true },
            });

            if (!existingUser) {
                // Throw error instead of return, let middleware handle it
                const error: any = new Error('User not found');
                error.statusCode = 404;
                throw error;
            }

            const result = await prisma.$transaction(async (tx) => {
                // Prepare user update data
                const userUpdateData: any = {
                    firstName,
                    lastName,
                    email,
                };

                // Hash password if provided
                if (password) {
                    userUpdateData.password = await bcrypt.hash(password, 10);
                }

                // Update the base user
                const updatedUser = await tx.user.update({
                    where: { id },
                    data: userUpdateData,
                    select: userSelect
                });

                // Update role-specific records
                switch (existingUser.role) {
                    case UserRole.TEACHER:
                        if (rest.specialization !== undefined) {
                            await tx.teacher.update({
                                where: { userId: id },
                                data: { specialization: rest.specialization },
                            });
                        }
                        break;
                    case UserRole.STUDENT:
                        if (rest.dateOfBirth !== undefined) {
                            await tx.student.update({
                                where: { userId: id },
                                data: { dateOfBirth: rest.dateOfBirth },
                            });
                        }
                        break;
                    case UserRole.GUARDIAN:
                        const guardianUpdateData: any = {};
                        if (rest.phoneNumber !== undefined) {
                            guardianUpdateData.phoneNumber = rest.phoneNumber;
                        }
                        if (rest.address !== undefined) {
                            guardianUpdateData.address = rest.address;
                        }
                        if (Object.keys(guardianUpdateData).length > 0) {
                            await tx.guardian.update({
                                where: { userId: id },
                                data: guardianUpdateData,
                            });
                        }
                        break;
                }

                return updatedUser;
            });

            res.status(200).json({
                message: "User updated successfully",
                user: result,
            });
        } catch (error) {
            next(error);
        }
    },

    async getAllUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const skip = (page - 1) * limit;

            const [users, total] = await Promise.all([
                prisma.user.findMany({
                    skip,
                    take: limit,
                    select: userSelect
                }),
                prisma.user.count()
            ]);

            res.status(200).json({
                message: "Users retrieved successfully",
                users: users,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            next(error);
        }
    },

    async getUserById(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;
        try {
            const user = await prisma.user.findUnique({
                where: { id },
                select: {
                    ...userSelect,
                    // If you need deeper nesting for a specific view:
                    guardian: {
                        include: { students: true }
                    }
                }
            });

            if (!user) {
                const error: any = new Error('User not found');
                error.statusCode = 404;
                throw error;
            }

            res.status(200).json({
                message: "User found",
                user: user
            });
        } catch (error) {
            next(error);
        }
    },

    async deleteUser(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;
        try {
            await prisma.user.delete({ where: { id } });
            res.status(200).json({ message: "User deleted successfully" });
        } catch (error) {
            next(error);
        }
    },

    async profile(req: Request & { user?: AuthPayload }, res: Response, next: NextFunction) {
        const userPayload = req.user;

        if (!userPayload) {
            const error: any = new Error('Unauthorized');
            error.statusCode = 401;
            return next(error);
        }

        try {
            const user = await prisma.user.findUnique({
                where: { id: userPayload.id },
                select: userSelect
            });

            if (!user) {
                const error: any = new Error('User not found');
                error.statusCode = 404;
                throw error;
            }

            res.status(200).json({
                message: "User profile retrieved successfully",
                user
            });
        } catch (error) {
            next(error);
        }
    }
};