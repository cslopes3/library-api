import { BooksRepository } from '@repository/books-repository';
import { ReservationsRepository } from '@repository/reservations-repository';
import { SchedulesRepository } from '@repository/schedules-repository';
import { UsersRepository } from '@repository/users-repository';
import {
    CreateReservationScheduleInputDto,
    CreateReservationScheduleOutputDto,
} from './create-reservation-schedule-dto';
import { Either, left, right } from '@shared/errors/either';
import { BookDoesNotExistsError } from '@usecase/@errors/book-does-not-exists-error';
import { UserDoesNotExistsError } from '@usecase/@errors/user-does-not-exists-error';
import dayjs from 'dayjs';
import { ScheduleDeadlineError } from '@usecase/@errors/schedule-deadline-error';
import { dateIsSameOrBeforeCurrentDate } from '@shared/utils/date-is-same-or-before-current-date';
import { ReserveLimitError } from '@usecase/@errors/reserve-limit-error';
import { Reservation } from '@domain/entities/reservation';
import { ScheduleLimitOfSameBookError } from '@usecase/@errors/schedule-limit-of-same-book-error';
import { Schedule, ScheduleStatus } from '@domain/entities/schedule';
import { BookNotAvailableError } from '@usecase/@errors/book-not-available-error';
import { ScheduleItem } from '@domain/value-objects/schedule-item';

export class CreateReservationScheduleUseCase {
    constructor(
        private schedulesRepository: SchedulesRepository,
        private reservationsRepository: ReservationsRepository,
        private booksRepository: BooksRepository,
        private usersRepository: UsersRepository,
    ) {}

    async execute({
        date,
        userId,
        scheduleItems,
    }: CreateReservationScheduleInputDto): Promise<
        Either<
            | UserDoesNotExistsError
            | BookDoesNotExistsError
            | BookNotAvailableError
            | ScheduleDeadlineError
            | ReserveLimitError
            | ScheduleLimitOfSameBookError,
            CreateReservationScheduleOutputDto
        >
    > {
        const user = await this.usersRepository.findById(userId);

        if (!user) {
            return left(new UserDoesNotExistsError());
        }

        const bookIds = scheduleItems.map((book) => book.bookId);

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

        if (!isValidScheduleDate(date)) {
            return left(new ScheduleDeadlineError());
        }

        const userReservations =
            await this.reservationsRepository.findByUserId(userId);

        let numberOfBooksAlreadyReserved: number = 0;

        if (userReservations.length > 0) {
            numberOfBooksAlreadyReserved =
                howManyBookAlreadyReserved(userReservations);
        }

        const numberOfBooksReserved =
            scheduleItems.length + numberOfBooksAlreadyReserved;

        if (numberOfBooksReserved > 3) {
            return left(new ReserveLimitError(numberOfBooksAlreadyReserved));
        }

        const currentDateSubtractThirtyDays = dayjs()
            .subtract(30, 'days')
            .toDate();

        const schedules =
            await this.schedulesRepository.findByUserIdAndLastDays(
                userId,
                currentDateSubtractThirtyDays,
            );

        const booksThatCantBeSchedule = findBooksThatCantBeSchedule(
            scheduleItems,
            schedules,
        );

        if (booksThatCantBeSchedule.length > 0) {
            return left(
                new ScheduleLimitOfSameBookError(booksThatCantBeSchedule),
            );
        }

        allWantedBooks.forEach(async (book) => {
            await this.booksRepository.removeBookFromStock(
                book.id.toString(),
                1,
            );
        });

        const schedule = new Schedule({
            date: date,
            userId: userId,
            scheduleItems: scheduleItems.map(
                (item) => new ScheduleItem(item.bookId, item.name),
            ),
            status: ScheduleStatus.pending,
        });

        await this.schedulesRepository.create(schedule);

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

function isValidScheduleDate(date: Date): boolean {
    //5 work days is the same of considering 7 days
    const limitDate = dayjs().add(7, 'day');
    const convertedDate = dayjs(date);
    const isSunday = dayjs().day() === 0;
    const isSameOrBeforeLimitDate =
        convertedDate.isBefore(limitDate) || convertedDate.isSame(limitDate);
    const isSameOrBeforeCurrentDate = dateIsSameOrBeforeCurrentDate(
        convertedDate.toDate(),
    );

    return isSameOrBeforeLimitDate && isSameOrBeforeCurrentDate && !isSunday;
}

function howManyBookAlreadyReserved(userReservations: Reservation[]): number {
    let numberOfBooksAlreadyReserved: number = 0;

    userReservations.forEach((reservation) => {
        reservation.reservationItem.forEach((item) => {
            if (!item.returned) {
                numberOfBooksAlreadyReserved += 1;
            }
        });
    });

    return numberOfBooksAlreadyReserved;
}

type scheduleItemsType = {
    bookId: string;
    name: string;
};

function findBooksThatCantBeSchedule(
    scheduleItems: scheduleItemsType[],
    schedules: Schedule[],
): string[] {
    const scheduleBooks = scheduleItems.map((book) => ({
        id: book.bookId,
        name: book.name,
        times: 0,
    }));

    schedules.forEach((schedule) => {
        schedule.scheduleItems.forEach((item) => {
            const scheduleBookId = item.bookId;

            scheduleBooks.map((book) => {
                if (book.id === scheduleBookId) {
                    book.times += 1;
                }
            });
        });
    });

    const booksThatCantBeSchedule: string[] = [];

    scheduleBooks.forEach((book) => {
        if (book.times >= 2) {
            booksThatCantBeSchedule.push(book.name);
        }
    });

    return booksThatCantBeSchedule;
}
