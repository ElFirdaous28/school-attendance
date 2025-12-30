import { z } from "zod";

export const createSubjectSchema = z.object({
    name: z.string().min(1, "Subject name is required"),
    code: z.string().min(1, "Subject code is required"),
    description: z.string().optional(),
}).strict();

export const updateSubjectSchema = z.object({
    name: z.string().min(1, "Subject name is required").optional(),
    code: z.string().min(1, "Subject code is required").optional(),
    description: z.string().optional(),
}).strict();