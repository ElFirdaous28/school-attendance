import { z } from "zod";

export const createTeacherSchema = z.object({
    userId: z.string().uuid("Invalid user ID"),
    specialization: z.string().optional(),
});

export const updateTeacherSchema = z.object({
    specialization: z.string().optional(),
});