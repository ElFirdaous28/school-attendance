import z from "zod";

export const createGuardianSchema = z.object({
    userId: z.string().uuid("Invalid user ID"),
    phoneNumber: z.string().optional(),
    address: z.string().optional(),
});

export const updateGuardianSchema = z.object({
    phoneNumber: z.string().optional(),
    address: z.string().optional(),
});