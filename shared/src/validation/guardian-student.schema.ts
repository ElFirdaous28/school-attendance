import { z } from "zod";

export const createGuardianStudentSchema = z.object({
    guardianId: z.string().uuid("Invalid guardian ID"),
    studentId: z.string().uuid("Invalid student ID"),
    relationType: z.string().min(1, "Relation type is required"),
    isPrimary: z.boolean().default(false),
}).strict();

export const updateGuardianStudentSchema = z.object({
    relationType: z.string().min(1, "Relation type is required").optional(),
    isPrimary: z.boolean().optional(),
}).strict();