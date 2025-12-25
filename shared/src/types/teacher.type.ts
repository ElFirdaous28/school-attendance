import { User } from "./user.type";

export interface Teacher {
    id: string;
    userId: string;
    specialization: string;
    user?: User;
}