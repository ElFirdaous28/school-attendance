// role-authorization.middlware.ts
import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
export function authorizeRoles(...allowedRoles: UserRole[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        const userRole = req.user?.role;
        if (!userRole || !allowedRoles.includes(userRole)) {
            return res.status(403).json({ message: 'Forbidden: You do not have the required permissions.' });
        }
        next();
    };
}

export default authorizeRoles;