import { UserRole } from "../enums/index.js";

export type LoginPayload = {
    email: string;
    password: string;
};

export type AuthUser = {
    id: string;
    email: string;
    fullname: string;
    role: UserRole;
};

export type LoginResponse = {
    accessToken: string;
    user: AuthUser;
};
