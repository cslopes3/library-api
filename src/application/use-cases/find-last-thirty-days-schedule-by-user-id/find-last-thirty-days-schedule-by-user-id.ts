import { SchedulesRepository } from '@repository/schedules-repository';
import { UsersRepository } from '@repository/users-repository';
import {
    FindLastThirtyDaysScheduleByUserIdInputDto,
    FindLastThirtyDaysScheduleByUserIdOutputDto,
} from './find-last-thirty-days-schedule-by-user-id-dto';
import { UserDoesNotExistsError } from '@usecase/@errors/user-does-not-exists-error';
import { Either, left, right } from '@shared/errors/either';
import dayjs from 'dayjs';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FindLastThirtyScheduleByUserIdUseCase {
    constructor(
        private schedulesRepository: SchedulesRepository,
        private usersRepository: UsersRepository,
    ) {}

    async execute({
        userId,
    }: FindLastThirtyDaysScheduleByUserIdInputDto): Promise<
        Either<
            UserDoesNotExistsError,
            FindLastThirtyDaysScheduleByUserIdOutputDto[] | []
        >
    > {
        const user = await this.usersRepository.findById(userId);

        if (!user) {
            return left(new UserDoesNotExistsError());
        }

        const currentDateSubtractThirtyDays = dayjs()
            .subtract(30, 'days')
            .toDate();

        const schedules =
            await this.schedulesRepository.findByUserIdAndLastDays(
                userId,
                currentDateSubtractThirtyDays,
            );

        return right(
            schedules.map((schedule) => ({
                id: schedule.id.toString(),
                date: schedule.date,
                userId: schedule.userId,
                scheduleItems: schedule.scheduleItems.map((item) => ({
                    id: item.id.toString(),
                    bookId: item.bookId,
                    name: item.name,
                })),
                status: schedule.status.toString(),
                createdAt: schedule.createdAt,
                updatedAt: schedule.updatedAt,
            })),
        );
    }
}
