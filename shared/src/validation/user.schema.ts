import { z } from "zod";
import { UserRole } from "@school/shared";

export const createUserSchema = z
    .object({
        email: z.string().email("Invalid email format"),
        firstName: z.string().min(1, "First name is required"),
        lastName: z.string().min(1, "Last name is required"),
        role: z.nativeEnum(UserRole),

        // role-specific (optional here, required conditionally)
        specialization: z.string().optional(),
        dateOfBirth: z
            .string()
            .optional()
            .transform(v => (v ? new Date(v) : undefined)),
        phoneNumber: z.string().optional(),
        address: z.string().optional(),
    })
    .strict()
    .superRefine((data, ctx) => {
        if (data.role === UserRole.STUDENT) {
            if (!data.dateOfBirth || isNaN(data.dateOfBirth.getTime())) {
                ctx.addIssue({
                    path: ["dateOfBirth"],
                    message: "Valid date of birth is required",
                    code: z.ZodIssueCode.custom,
                });
            }
        }

        if (data.role === UserRole.TEACHER && !data.specialization) {
            ctx.addIssue({
                path: ["specialization"],
                message: "Specialization is required for teachers",
                code: z.ZodIssueCode.custom,
            });
        }
    });

export const updateUserSchema = z
    .object({
        email: z.string().email("Invalid email format").optional(),
        firstName: z.string().min(1, "First name is required").optional(),
        lastName: z.string().min(1, "Last name is required").optional(),

        // role-specific fields for updates
        specialization: z.string().optional(),
        dateOfBirth: z
            .string()
            .optional()
            .transform(v => (v ? new Date(v) : undefined)),
        phoneNumber: z.string().optional(),
        address: z.string().optional(),
    })
    .strict();

export const loginSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
}).strict();