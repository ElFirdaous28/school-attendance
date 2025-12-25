import { SessionStatus } from '../enums';

export interface Session {
    id: string;
    classId: string;
    teacherId: string;
    date: Date;
    startTime: Date;
    endTime: Date;
    status: SessionStatus;
}