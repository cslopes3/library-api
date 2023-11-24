import { BooksRepository } from '@repository/books-repository';
import { ReservationsRepository } from '@repository/reservations-repository';
import {
    ReturnAllItemsFromReservationInputDto,
    ReturnAllItemsFromReservationOutputDto,
} from './return-all-items-from-reservation-dto';
import { Either, left, right } from '@shared/errors/either';
import { ResourceNotFoundError } from '@usecase/@errors/resource-not-found-error';
import { AllItemsAlreadyReturnedError } from '@usecase/@errors/all-items-already-returned-error';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ReturnAllItemsFromReservationUseCase {
    constructor(
        private reservationsRepository: ReservationsRepository,
        private booksRepository: BooksRepository,
    ) {}

    async execute({
        id,
    }: ReturnAllItemsFromReservationInputDto): Promise<
        Either<
            ResourceNotFoundError | AllItemsAlreadyReturnedError,
            ReturnAllItemsFromReservationOutputDto
        >
    > {
        const reservation = await this.reservationsRepository.findById(id);

        if (!reservation) {
            return left(new ResourceNotFoundError());
        }

        let allItemsReturned = true;

        const items = reservation.reservationItem;
        for (let i = 0; i < items.length; i++) {
            if (!items[i].returned) {
                allItemsReturned = false;

                await this.booksRepository.addBookToStock(items[i].bookId, 1);
                await this.reservationsRepository.returnByItemId(
                    items[i].id.toString(),
                    new Date(),
                );

                reservation.reservationItem[i].changeReturnRecord(
                    new Date(),
                    true,
                );
            }
        }

        if (allItemsReturned) {
            return left(new AllItemsAlreadyReturnedError());
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
                returnDate: item.returnDate!,
            })),
            createdAt: reservation.createdAt,
            updatedAt: reservation.updatedAt,
        });
    }
}
