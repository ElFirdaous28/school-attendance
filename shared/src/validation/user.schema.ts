import { z } from "zod";
import { UserRole } from "@school/shared";

export const createUserSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    role: z.nativeEnum(UserRole),
});

export const updateUserSchema = z.object({
    email: z.string().email("Invalid email format").optional(),
    password: z.string().min(8, "Password must be at least 8 characters").optional(),
    firstName: z.string().min(1, "First name is required").optional(),
    lastName: z.string().min(1, "Last name is required").optional(),
    role: z.nativeEnum(UserRole).optional(),
});

export const loginSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
});