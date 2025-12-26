import { z } from "zod";
import { AttendanceStatus } from "@school/shared";

export const createAttendanceSchema = z.object({
    sessionId: z.string().uuid("Invalid session ID"),
    studentId: z.string().uuid("Invalid student ID"),
    status: z.nativeEnum(AttendanceStatus).default(AttendanceStatus.PRESENT),
    notes: z.string().optional(),
});

export const updateAttendanceSchema = z.object({
    status: z.nativeEnum(AttendanceStatus).optional(),
    notes: z.string().optional(),
});