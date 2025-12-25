import { ClassStatus } from '../enums';

export interface Class {
    id: string;
    name: string;
    level: string;
    capacity: number;
    startDate: Date;
    endDate?: Date | null;
    status: ClassStatus;
    subjectId: string;
}