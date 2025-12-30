import { z } from "zod";
import { EnrollmentStatus } from "@school/shared";

export const createStudentClassSchema = z.object({
    studentId: z.string().uuid("Invalid student ID"),
    classId: z.string().uuid("Invalid class ID"),
    enrollmentEnd: z.coerce.date().optional(),
    status: z.nativeEnum(EnrollmentStatus).default(EnrollmentStatus.ACTIVE),
    notes: z.string().optional(),
}).strict();

export const updateStudentClassSchema = z.object({
    enrollmentEnd: z.coerce.date().optional(),
    status: z.nativeEnum(EnrollmentStatus).optional(),
    notes: z.string().optional(),
}).strict();