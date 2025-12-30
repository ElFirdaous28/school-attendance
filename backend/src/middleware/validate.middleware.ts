import { Request, Response, NextFunction } from "express";
import { ZodObject, ZodRawShape } from "zod";

const validate = (schema: ZodObject<ZodRawShape>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            // Zod errors are in result.error.issues
            return res.status(400).json({
                message: "Validation failed",
                errors: result.error.issues.map((issue) => ({
                    path: issue.path.join('.'),
                    message: issue.message
                })),
            });
        }

        // Optionally replace req.body with validated data
        req.body = result.data;
        next();
    };
};

export default validate;
