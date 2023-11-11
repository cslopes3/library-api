import { Schedule, ScheduleStatus } from '@domain/entities/schedule';
import { ScheduleItem } from '@domain/value-objects/schedule-item';
import {
    Prisma,
    Schedule as PrismaSchedule,
    ScheduleItem as PrismaScheduleItem,
} from '@prisma/client';

type PrismaScheduleWithItems = PrismaSchedule & {
    scheduleItems: PrismaScheduleItem[];
};

type PrismaScheduleWithItemsToPersistent =
    Prisma.ScheduleUncheckedCreateInput & {
        scheduleItems: Prisma.ScheduleItemUncheckedCreateInput[];
    };

export class PrismaScheduleMapper {
    static toDomainLayer(raw: PrismaScheduleWithItems): Schedule {
        return new Schedule(
            {
                date: raw.date,
                userId: raw.userId,
                scheduleItems: raw.scheduleItems.map(
                    (item) => new ScheduleItem(item.bookId, item.name, item.id),
                ),
                status: ScheduleStatus[raw.status],
            },
            raw.id,
            raw.createdAt,
            raw.updatedAt ?? undefined,
        );
    }

    static toPersistent(
        schedule: Schedule,
    ): PrismaScheduleWithItemsToPersistent {
        return {
            id: schedule.id.toString(),
            userId: schedule.userId,
            date: schedule.date,
            scheduleItems: schedule.scheduleItems.map((item) => ({
                id: item.id.toString(),
                scheduleId: schedule.id.toString(),
                bookId: item.bookId,
                name: item.name,
            })),
            status: schedule.status,
        };
    }
}
