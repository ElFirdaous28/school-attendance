// shared/src/types/express.d.ts
import 'express';
import { UserRole } from '@prisma/client';

export interface AuthPayload {
    id: string;
    role: UserRole;
    email: string;
    fullname: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: AuthPayload;
        }
    }
}
