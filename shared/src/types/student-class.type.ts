import { EnrollmentStatus } from '../enums';
import { Student } from './student.type';
import { Class } from './class.type';

export interface StudentClass {
    id: string;
    studentId: string;
    classId: string;
    enrolledAt: Date;
    enrollmentEnd?: Date | null;
    status: EnrollmentStatus;
    notes?: string | null;
    student?: Student;
    class?: Class;
}