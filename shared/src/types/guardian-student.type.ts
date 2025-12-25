import { Guardian } from './guardian.type';
import { Student } from './student.type';

export interface GuardianStudent {
    id: string;
    guardianId: string;
    studentId: string;
    relationType: string;
    isPrimary: boolean;
    guardian?: Guardian;
    student?: Student;
}