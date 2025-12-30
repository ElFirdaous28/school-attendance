import { z } from "zod";
import { SessionStatus } from "@school/shared";

export const createSessionSchema = z.object({
    classId: z.string().uuid("Invalid class ID"),
    teacherId: z.string().uuid("Invalid teacher ID"),
    date: z.coerce.date(),
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
    status: z.nativeEnum(SessionStatus).default(SessionStatus.DRAFT),
}).refine((data) => data.endTime > data.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
}).strict();

export const updateSessionSchema = z.object({
    // classId: z.string().uuid("Invalid class ID").optional(),
    // teacherId: z.string().uuid("Invalid teacher ID").optional(),
    date: z.coerce.date().optional(),
    startTime: z.coerce.date().optional(),
    endTime: z.coerce.date().optional(),
    status: z.nativeEnum(SessionStatus).optional(),
}).strict();