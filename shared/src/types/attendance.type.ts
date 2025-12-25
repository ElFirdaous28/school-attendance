import { AttendanceStatus } from '../enums';

export interface Attendance {
    id: string;
    sessionId: string;
    studentId: string;
    status: AttendanceStatus;
    notes?: string | null;
    createdAt: Date;
    updatedAt: Date;
}