import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";

interface CustomError extends Error {
    statusCode?: number;
    code?: string | number;
    keyValue?: Record<string, unknown>;
    errors?: any;
    name: string;
    meta?: any;
}

const errorHandler = (
    err: CustomError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error(err);

    let statusCode = err.statusCode || 500;
    let message = err.message || "Something went wrong";
    let error = err.name || "Error";
    let field: string | undefined;

    // Handle Prisma errors
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        switch (err.code) {
            case 'P2002':
                statusCode = 409;
                let field = 'field';

                const driverError = err.meta?.driverAdapterError as any;
                if (driverError?.cause?.constraint?.fields?.length) {
                    field = driverError.cause.constraint.fields[0];
                }

                message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
                error = 'Duplicate entry';
                break;

            case 'P2025':
                // Record not found
                statusCode = 404;
                message = 'Record not found';
                error = 'Not found';
                break;

            case 'P2003':
                // Foreign key constraint failed
                statusCode = 400;
                message = 'Related record not found';
                error = 'Foreign key constraint';
                break;

            case 'P2014':
                // Required relation violation
                statusCode = 400;
                message = 'The change you are trying to make would violate a required relation';
                error = 'Relation error';
                break;

            default:
                statusCode = 400;
                message = 'Database operation failed';
                error = 'Database error';
        }
    }

    // Handle Prisma validation errors
    if (err instanceof Prisma.PrismaClientValidationError) {
        statusCode = 400;
        message = 'Invalid data provided';
        error = 'Validation error';
    }

    // Handle Zod validation errors
    if (err.name === "ZodError" && err.errors) {
        statusCode = 400;
        error = 'Validation failed';

        if (Array.isArray(err.errors)) {
            // Extract first error field
            field = err.errors[0]?.path?.join('.');
            message = err.errors
                .map((e: any) => `${e.path.join('.')}: ${e.message}`)
                .join(", ");
        } else {
            message = err.message;
        }
    }

    // JWT errors
    if (err.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid token";
        error = "Authentication error";
    }

    if (err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Token expired";
        error = "Authentication error";
    }

    // Build response
    const response: any = {
        error,
        message,
    };

    // Add field if present
    if (field) {
        response.field = field;
    }

    // Only include stack in dev
    if (process.env.NODE_ENV !== "production") {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
};

export default errorHandler;