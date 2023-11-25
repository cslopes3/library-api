import { ReservationsRepository } from '@repository/reservations-repository';
import {
    ExtendReservationInputDto,
    ExtendReservationOutputDto,
} from './extend-reservation-dto';
import { Either, left, right } from '@shared/errors/either';
import { ResourceNotFoundError } from '@usecase/@errors/resource-not-found-error';
import dayjs from 'dayjs';
import { AlreadyExtendedError } from '@usecase/@errors/already-extended-error';
import { ExpiredDateError } from '@usecase/@errors/expired-date-error';
import { AllItemsAlreadyReturnedError } from '@usecase/@errors/all-items-already-returned-error';
import { dateIsSameOrBeforeCurrentDate } from '@shared/utils/date-is-same-or-before-current-date';
import { Injectable } from '@nestjs/common';
import { UsersRepository } from '@repository/users-repository';
import { NotAllowedError } from '@usecase/@errors/not-allowed-error';

@Injectable()
export class ExtendReservationUseCase {
    constructor(
        private reservationsRepository: ReservationsRepository,
        private usersRepository: UsersRepository,
    ) {}

    async execute({
        id,
        currentUserId,
    }: ExtendReservationInputDto): Promise<
        Either<
            | ResourceNotFoundError
            | AlreadyExtendedError
            | ExpiredDateError
            | AllItemsAlreadyReturnedError
            | NotAllowedError,
            ExtendReservationOutputDto
        >
    > {
        const reservation = await this.reservationsRepository.findById(id);

        if (!reservation) {
            return left(new ResourceNotFoundError());
        }

        const user = await this.usersRepository.findById(currentUserId);

        if (user?.role !== 'admin' && currentUserId !== reservation.userId) {
            return left(new NotAllowedError());
        }

        const allUserReservations =
            await this.reservationsRepository.findByUserId(reservation.userId);

        let allItemsReturned: boolean = true;

        for (let i = 0; i < allUserReservations.length; i++) {
            const items = allUserReservations[i].reservationItem;
            for (let j = 0; j < items.length; j++) {
                const returnedItem = items[j].returned;
                const expirationDate = items[j].expirationDate;

                if (returnedItem) {
                    continue;
                }

                allItemsReturned = false;

                const expirationDateIsSameOrBeforeCurrentDate =
                    dateIsSameOrBeforeCurrentDate(expirationDate);

                if (!expirationDateIsSameOrBeforeCurrentDate) {
                    return left(new ExpiredDateError());
                }
            }
        }

        if (allItemsReturned) {
            return left(new AllItemsAlreadyReturnedError());
        }

        const items = reservation.reservationItem;
        for (let i = 0; i < items.length; i++) {
            if (items[i].alreadyExtendTime) {
                return left(new AlreadyExtendedError());
            }

            const expirationDate = dayjs(items[i].expirationDate)
                .add(30, 'days')
                .toDate();

            await this.reservationsRepository.changeReservationInfoById(
                items[i].id.toString(),
                expirationDate,
                true,
            );

            reservation.reservationItem[i].changeExpirationDate(expirationDate);
            reservation.reservationItem[i].changeAlreadyExtendTime(true);
        }

        return right({
            id: reservation.id.toString(),
            userId: reservation.userId,
            reservationItems: reservation.reservationItem.map((item) => ({
                id: item.id.toString(),
                bookId: item.bookId,
                name: item.name,
                expirationDate: item.expirationDate,
                alreadyExtendTime: item.alreadyExtendTime,
                returned: item.returned,
            })),
            createdAt: reservation.createdAt,
            updatedAt: reservation.updatedAt,
        });
    }
}
