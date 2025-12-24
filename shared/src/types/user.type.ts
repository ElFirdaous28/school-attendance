import { UserRole } from "../enums";

export interface User {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
    createdAt: string;
}
