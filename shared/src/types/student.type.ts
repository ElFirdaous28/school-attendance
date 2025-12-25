import { User } from "./user.type";

export interface Student {
    id: string;
    userId: string;
    studentNumber: string;
    dateOfBirth: Date;
    user?: User;
}