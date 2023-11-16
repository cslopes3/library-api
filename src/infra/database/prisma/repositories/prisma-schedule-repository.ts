import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { SchedulesRepository } from '@repository/schedules-repository';
import { Schedule } from '@domain/entities/schedule';
import { PrismaScheduleMapper } from '../mappers/prisma-schedule-mapper';

@Injectable()
export class PrismaSchedulesRepository implements SchedulesRepository {
    constructor(private prisma: PrismaService) {}

    async create(schedule: Schedule): Promise<void> {
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
    }

    async findById(id: string): Promise<Schedule | null> {
        const schedule = await this.prisma.schedule.findUnique({
            where: {
                id,
            },
            include: {
                scheduleItems: true,
            },
        });

        if (!schedule) {
            return null;
        }

        return PrismaScheduleMapper.toDomainLayer(schedule);
    }

    async findByUserIdAndLastDays(
        userId: string,
        minimumDate?: Date,
    ): Promise<Schedule[] | []> {
        const schedule = await this.prisma.schedule.findMany({
            where: {
                userId,
                ...(minimumDate ? { createdAt: { gte: minimumDate } } : {}),
            },
            include: {
                scheduleItems: true,
            },
        });

        return schedule.map(PrismaScheduleMapper.toDomainLayer);
    }

    async changeStatus(id: string, status: string): Promise<void> {
        await this.prisma.schedule.update({
            data: {
                status,
            },
            where: {
                id,
            },
        });
    }
}
