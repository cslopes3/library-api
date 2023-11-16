import { Schedule, ScheduleStatus } from '@domain/entities/schedule';
import { ScheduleItem } from '@domain/value-objects/schedule-item';

export class FakeScheduleFactory {
    static create(options?: Partial<Schedule>, id?: string): Schedule {
        const scheduleDefaultValues = {
            date: new Date(),
            userId: '1',
            scheduleItems: [new ScheduleItem('1', 'Book 1')],
            status: ScheduleStatus.pending,
        };

        return new Schedule(
            { ...scheduleDefaultValues, ...options },
            id ?? '1',
        );
    }
}
