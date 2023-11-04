import { BooksRepository } from '@repository/books-repository';
import { ReservationsRepository } from '@repository/reservations-repository';
import { UsersRepository } from '@repository/users-repository';
import {
    CreateReservationInputDto,
    CreateReservationOutputDto,
} from './create-reservation-dto';
import { Either, left, right } from '@shared/errors/either';
import { BookDoesNotExistsError } from '@usecase/@errors/book-does-not-exists-error';
import { UserDoesNotExistsError } from '@usecase/@errors/user-does-not-exists-error';
import { ReserveLimitError } from '@usecase/@errors/reserve-limit-error';
import { BookWithReturnDateExpiredError } from '@usecase/@errors/book-with-return-date-expired-error';
import { Reservation } from '@domain/entities/reservation';
import { ReservationItem } from '@domain/value-objects/resevation-item';
import { BookNotAvailableError } from '@usecase/@errors/book-not-available-error';
import dayjs from 'dayjs';

export class CreateReservationUseCase {
    constructor(
        private reservationsRepository: ReservationsRepository,
        private booksRepository: BooksRepository,
        private usersRepository: UsersRepository,
    ) {}

    async execute({
        userId,
        reservationItems,
    }: CreateReservationInputDto): Promise<
        Either<
            | UserDoesNotExistsError
            | BookDoesNotExistsError
            | ReserveLimitError
            | BookWithReturnDateExpiredError
            | BookNotAvailableError,
            CreateReservationOutputDto
        >
    > {
        const user = await this.usersRepository.findById(userId);

        if (!user) {
            return left(new UserDoesNotExistsError());
        }

        const bookIds = reservationItems.map((book) => book.bookId);

        const allWantedBooks = await this.booksRepository.findMany(
            { page: 1 },
            bookIds,
        );

        if (allWantedBooks.length !== bookIds.length) {
            return left(new BookDoesNotExistsError());
        }

        const booksNotAvailable = allWantedBooks.filter(
            (book) => book.available === 0,
        );

        if (booksNotAvailable.length > 0) {
            const nameOfBooks = booksNotAvailable.map((book) => book.name);
            return left(new BookNotAvailableError(nameOfBooks));
        }

        const userReservations =
            await this.reservationsRepository.findByUserId(userId);

        let numberOfBooksAlreadyReserved: number = 0;

        if (userReservations.length > 0) {
            let bookWithReturnDateExpired: boolean = false;

            userReservations.forEach((reservation) => {
                reservation.reservationItem.forEach((item) => {
                    if (!item.returned) {
                        numberOfBooksAlreadyReserved += 1;

                        if (dayjs(item.expirationDate).day() < dayjs().day()) {
                            bookWithReturnDateExpired = true;
                        }
                    }
                });
            });

            if (bookWithReturnDateExpired) {
                return left(new BookWithReturnDateExpiredError());
            }
        }

        const numberOfBooksReserved =
            reservationItems.length + numberOfBooksAlreadyReserved;

        if (numberOfBooksReserved > 3) {
            return left(new ReserveLimitError(numberOfBooksAlreadyReserved));
        }

        const currentDate = dayjs();
        const expirationDate = currentDate.add(30, 'day').toDate();

        const reservation = new Reservation({
            userId,
            reservationItem: reservationItems.map(
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

        reservationItems.forEach(async (item) => {
            await this.booksRepository.removeBookFromStock(item.bookId, 1);
        });

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
