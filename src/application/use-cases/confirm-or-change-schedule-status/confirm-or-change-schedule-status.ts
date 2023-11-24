import { BooksRepository } from '@repository/books-repository';
import { ReservationsRepository } from '@repository/reservations-repository';
import { SchedulesRepository } from '@repository/schedules-repository';
import { ConfirmOrChangeStatusInputDto } from './confirm-or-change-schedule-status-dto';
import { Either, left, right } from '@shared/errors/either';
import { ResourceNotFoundError } from '@usecase/@errors/resource-not-found-error';
import { CantChangeStatusError } from '@usecase/@errors/cant-change-status-error';
import { ScheduleStatus } from '@domain/entities/schedule';
import { Reservation } from '@domain/entities/reservation';
import { ReservationItem } from '@domain/value-objects/resevation-item';
import dayjs from 'dayjs';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfirmOrChangeScheduleStatusUseCase {
    constructor(
        private schedulesRepository: SchedulesRepository,
        private reservationsRepository: ReservationsRepository,
        private booksRepository: BooksRepository,
    ) {}

    async execute({
        id,
        status,
    }: ConfirmOrChangeStatusInputDto): Promise<
        Either<ResourceNotFoundError | CantChangeStatusError, null>
    > {
        const schedule = await this.schedulesRepository.findById(id);

        if (!schedule) {
            return left(new ResourceNotFoundError());
        }

        if (schedule.status !== ScheduleStatus.pending) {
            return left(new CantChangeStatusError());
        }

        await this.schedulesRepository.changeStatus(id, status);

        if (status === ScheduleStatus.finished) {
            const currentDate = dayjs();
            const expirationDate = currentDate.add(30, 'day').toDate();

            const reservation = new Reservation({
                userId: schedule.userId,
                reservationItem: schedule.scheduleItems.map(
                    (item) =>
                        new ReservationItem(
                            item.bookId,
                            item.name,
                            expirationDate,
                            false,
                            false,
                        ),
                ),
            });

            await this.reservationsRepository.create(reservation);
        } else {
            schedule.scheduleItems.forEach(async (item) => {
                await this.booksRepository.addBookToStock(item.bookId, 1);
            });
        }

        return right(null);
    }
}
