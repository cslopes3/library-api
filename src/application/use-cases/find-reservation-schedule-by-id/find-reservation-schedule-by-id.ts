import { SchedulesRepository } from '@repository/schedules-repository';
import {
    FindReservationScheduleByIdInputDto,
    FindReservationScheduleByIdOutputDto,
} from './find-reservartion-schedule-dto';
import { Either, left, right } from '@shared/errors/either';
import { Injectable } from '@nestjs/common';
import { UsersRepository } from '@repository/users-repository';
import { NotAllowedError } from '@usecase/@errors/not-allowed-error';

@Injectable()
export class FindReservationScheduleByIdUseCase {
    constructor(
        private schedulesRepository: SchedulesRepository,
        private usersRepository: UsersRepository,
    ) {}

    async execute({
        id,
        currentUserId,
    }: FindReservationScheduleByIdInputDto): Promise<
        Either<NotAllowedError, FindReservationScheduleByIdOutputDto | null>
    > {
        const schedule = await this.schedulesRepository.findById(id);

        if (!schedule) {
            return right(null);
        }

        const user = await this.usersRepository.findById(currentUserId);

        if (user?.role !== 'admin' && currentUserId !== schedule.userId) {
            return left(new NotAllowedError());
        }

        return right({
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
        });
    }
}
