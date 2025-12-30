import { z } from "zod";
import { ClassStatus } from "@school/shared";

export const createClassSchema = z.object({
    name: z.string().min(1, "Class name is required"),
    level: z.string().min(1, "Level is required"),
    capacity: z.number().int().positive("Capacity must be positive"),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    status: z.nativeEnum(ClassStatus).default(ClassStatus.ACTIVE),
    subjectId: z.string().uuid("Invalid subject ID"),
}).strict();

export const updateClassSchema = z.object({
    name: z.string().min(1, "Class name is required").optional(),
    level: z.string().min(1, "Level is required").optional(),
    capacity: z.number().int().positive("Capacity must be positive").optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    status: z.nativeEnum(ClassStatus).optional(),
    subjectId: z.string().uuid("Invalid subject ID").optional(),
}).strict();