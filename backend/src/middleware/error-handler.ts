import { Request, Response, NextFunction } from "express";

interface CustomError extends Error {
    statusCode?: number;
    code?: number;
    keyValue?: Record<string, unknown>;
    errors?: any;
    name: string;
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

    // Handle Yup or Zod validation errors
    if (err.name === "ValidationError" && err.errors) {
        statusCode = 400;

        if (Array.isArray(err.errors)) {
            message = err.errors.join(", ");
        } else if (typeof err.errors === "object") {
            message = Object.values(err.errors)
                .map((e: any) => e.message || e)
                .join(", ");
        } else {
            message = err.message;
        }
    }

    // Mongoose bad ObjectId
    if (err.name === "CastError") {
        statusCode = 400;
        message = "Invalid ID format";
    }

    // Duplicate key (email, etc.)
    if (err.code === 11000 && err.keyValue) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(400).json({
            errors: {
                [field]: `${field} already exists`,
            },
        });
    }

    // JWT errors
    if (err.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid token";
    }

    if (err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Token expired";
    }

    const response: any = {
        statusCode,
        message,
        error: err.name || "Error",
    };

    // Only include stack in dev
    if (process.env.NODE_ENV !== "production") {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
};

export default errorHandler;
