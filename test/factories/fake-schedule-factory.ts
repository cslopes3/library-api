import { Schedule, ScheduleStatus } from '@domain/entities/schedule';
import { ScheduleItem } from '@domain/value-objects/schedule-item';
import { PrismaScheduleMapper } from '@infra/database/prisma/mappers/prisma-schedule-mapper';
import { PrismaService } from '@infra/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

export function createFakeSchedule(options?: Partial<Schedule>): Schedule {
    const scheduleDefaultValues = {
        date: new Date(),
        userId: '1',
        scheduleItems: [new ScheduleItem('1', 'Book 1')],
        status: ScheduleStatus.pending,
    };

    return new Schedule({ ...scheduleDefaultValues, ...options });
}

@Injectable()
export class PrismaFakeSchedule {
    constructor(private prisma: PrismaService) {}

    async create(options?: Partial<Schedule>): Promise<Schedule> {
        const schedule = createFakeSchedule(options);

        const data = PrismaScheduleMapper.toPersistent(schedule);

        await this.prisma.schedule.create({
            data: {
                id: data.id,
                date: data.date,
                userId: data.userId,
                scheduleItems: {
                    create: data.scheduleItems.map((item) => ({
                        id: item.id,
                        bookId: item.bookId,
                        name: item.name,
                    })),
                },
                status: data.status,
            },
        });

        return schedule;
    }
}
