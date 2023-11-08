import { ScheduleItem } from '@domain/value-objects/schedule-item';
import { Entity } from '@shared/entities/base-entity';

export const ScheduleStatus = {
    pending: 'pending',
    canceled: 'canceled',
    finished: 'finished',
} as const;

type ScheduleStatusTypes = (typeof ScheduleStatus)[keyof typeof ScheduleStatus];

interface ScheduleProps {
    date: Date;
    userId: string;
    scheduleItems: ScheduleItem[];
    status: ScheduleStatusTypes;
}

export class Schedule extends Entity<ScheduleProps> {
    get date(): Date {
        return this.props.date;
    }

    get userId(): string {
        return this.props.userId;
    }

    get scheduleItems(): ScheduleItem[] {
        return this.props.scheduleItems;
    }

    get status(): ScheduleStatusTypes {
        return this.props.status;
    }
}
