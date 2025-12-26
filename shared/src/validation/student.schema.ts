import { z } from "zod";

export const createStudentSchema = z.object({
    userId: z.string().uuid("Invalid user ID"),
    studentNumber: z.string().min(1, "Student number is required"),
    dateOfBirth: z.coerce.date(),
});

export const updateStudentSchema = z.object({
    studentNumber: z.string().min(1, "Student number is required").optional(),
    dateOfBirth: z.coerce.date().optional(),
});