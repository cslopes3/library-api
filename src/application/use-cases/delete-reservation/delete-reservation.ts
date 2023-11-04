import { ReservationsRepository } from '@repository/reservations-repository';
import { DeleteReservationInputDto } from './delete-reservation-dto';
import { Either, left, right } from '@shared/errors/either';
import { ResourceNotFoundError } from '@usecase/@errors/resource-not-found-error';
import { BooksRepository } from '@repository/books-repository';

export class DeleteReservationUseCase {
    constructor(
        private reservationsRepository: ReservationsRepository,
        private booksRepository: BooksRepository,
    ) {}

    async execute({
        id,
    }: DeleteReservationInputDto): Promise<
        Either<ResourceNotFoundError, null>
    > {
        const reservation = await this.reservationsRepository.findById(id);

        if (!reservation) {
            return left(new ResourceNotFoundError());
        }

        reservation.reservationItem.forEach(async (item) => {
            await this.booksRepository.addBookToStock(item.bookId, 1);
        });

        await this.reservationsRepository.delete(id);

        return right(null);
    }
}
