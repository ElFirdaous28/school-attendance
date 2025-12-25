import { GuardianStudent } from './guardian-student.type';
import { User } from './user.type';

export interface Guardian {
    id: string;
    userId: string;
    phoneNumber: string;
    address: string;
    user?: User; // Link to user profile 
    students?: GuardianStudent[]; // Link to related students 
}