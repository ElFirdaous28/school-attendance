import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET as string) as {
            id: string;
            role: UserRole;
            fullname: string;
            email: string;
        };

        req.user = payload;
        next();
    } catch (error) {
        res.status(403).json({ message: 'Invalid or expired token' });
    }
};