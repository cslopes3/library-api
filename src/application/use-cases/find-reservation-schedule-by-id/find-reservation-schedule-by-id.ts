import { SchedulesRepository } from '@repository/schedules-repository';
import {
    FindReservationScheduleByIdInputDto,
    FindReservationScheduleByIdOutputDto,
} from './find-reservartion-schedule-dto';
import { Either, right } from '@shared/errors/either';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FindReservationScheduleByIdUseCase {
    constructor(private schedulesRepository: SchedulesRepository) {}

    async execute({
        id,
    }: FindReservationScheduleByIdInputDto): Promise<
        Either<null, FindReservationScheduleByIdOutputDto | null>
    > {
        const schedule = await this.schedulesRepository.findById(id);

        if (!schedule) {
            return right(null);
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
