import { User } from './user.type';

export interface Admin {
    id: string;
    userId: string;
    user?: User; // Link to the user profile 
}