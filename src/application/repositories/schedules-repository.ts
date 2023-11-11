import { Schedule } from '@domain/entities/schedule';

export abstract class SchedulesRepository {
    abstract create(schedule: Schedule): Promise<void>;
    abstract findById(id: string): Promise<Schedule | null>;
    abstract findByUserIdAndLastDays(
        userId: string,
        minimumDate?: Date,
    ): Promise<Schedule[] | []>;
    abstract changeStatus(id: string, status: string): Promise<void>;
}
