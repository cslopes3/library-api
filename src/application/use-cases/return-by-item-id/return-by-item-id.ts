import { BooksRepository } from '@repository/books-repository';
import { ReservationsRepository } from '@repository/reservations-repository';
import {
    ReturnByItemIdInputDto,
    ReturnByItemIdOutputDto,
} from './return-by-item-id-dto';
import { Either, left, right } from '@shared/errors/either';
import { ResourceNotFoundError } from '@usecase/@errors/resource-not-found-error';
import { AllItemsAlreadyReturnedError } from '@usecase/@errors/all-items-already-returned-error';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ReturnByItemIdUseCase {
    constructor(
        private reservationsRepository: ReservationsRepository,
        private booksRepository: BooksRepository,
    ) {}

    async execute({
        id,
    }: ReturnByItemIdInputDto): Promise<
        Either<
            ResourceNotFoundError | AllItemsAlreadyReturnedError,
            ReturnByItemIdOutputDto
        >
    > {
        const reservationItem =
            await this.reservationsRepository.findItemById(id);

        if (!reservationItem) {
            return left(new ResourceNotFoundError());
        }

        if (reservationItem.returned) {
            return left(new AllItemsAlreadyReturnedError());
        }

        await this.booksRepository.addBookToStock(reservationItem.bookId, 1);

        const returnDate = new Date();

        reservationItem.changeReturnRecord(returnDate, true);

        await this.reservationsRepository.returnByItemId(id, returnDate);

        return right({
            id: id,
            bookId: reservationItem.bookId,
            name: reservationItem.name,
            expirationDate: reservationItem.expirationDate,
            alreadyExtendTime: reservationItem.alreadyExtendTime,
            returned: reservationItem.returned,
            returnDate: returnDate,
        });
    }
}
