import { Book } from '@domain/entities/book';
import { Reservation } from '@domain/entities/reservation';
import { Schedule, ScheduleStatus } from '@domain/entities/schedule';
import { User } from '@domain/entities/user';
import { BookAuthors } from '@domain/value-objects/book-authors';
import { BookEdition } from '@domain/value-objects/book-edition';
import { BookPublisher } from '@domain/value-objects/book-publisher';
import { ReservationItem } from '@domain/value-objects/resevation-item';
import { ScheduleItem } from '@domain/value-objects/schedule-item';
import { BookDoesNotExistsError } from '@usecase/@errors/book-does-not-exists-error';
import { BookNotAvailableError } from '@usecase/@errors/book-not-available-error';
import { ReserveLimitError } from '@usecase/@errors/reserve-limit-error';
import { ScheduleDeadlineError } from '@usecase/@errors/schedule-deadline-error';
import { UserDoesNotExistsError } from '@usecase/@errors/user-does-not-exists-error';
import { CreateReservationScheduleUseCase } from './create-reservation-schedule';
import { ScheduleLimitOfSameBookError } from '@usecase/@errors/schedule-limit-of-same-book-error';

const SchedulesMockRepository = () => {
    return {
        create: vi.fn(),
        findById: vi.fn(),
        findByUserIdAndLastDays: vi.fn().mockReturnValue(Promise.resolve([])),
        changeStatus: vi.fn(),
    };
};

const ReservationsMockRepository = () => {
    return {
        findById: vi.fn(),
        findByUserId: vi.fn().mockReturnValue(Promise.resolve([])),
        delete: vi.fn(),
        create: vi.fn(),
        changeReservationInfoById: vi.fn(),
        returnByItemId: vi.fn(),
        findItemById: vi.fn(),
    };
};

const book = new Book(
    {
        name: 'Book 1',
        authors: [new BookAuthors('1', 'Author 1')],
        publisher: new BookPublisher('1', 'Publisher 1'),
        edition: new BookEdition(3, 'Book 1 description', 2023),
        quantity: 3,
        available: 3,
        pages: 200,
    },
    '1',
);

const BooksMockRepository = () => {
    return {
        findById: vi.fn(),
        findByName: vi.fn(),
        findMany: vi.fn().mockReturnValue(Promise.resolve([book])),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        addBookToStock: vi.fn(),
        removeBookFromStock: vi.fn(),
    };
};

const user = new User(
    {
        name: 'Name 1',
        email: 'email@email.com',
        password: '123456',
    },
    '1',
);

const UsersMockRepository = () => {
    return {
        findById: vi.fn().mockReturnValue(Promise.resolve(user)),
        findByEmail: vi.fn(),
        create: vi.fn(),
    };
};

const schedule = {
    date: new Date(),
    userId: '1',
    scheduleItems: [
        {
            bookId: '1',
            name: 'Book 1',
        },
    ],
};

describe('[UT] - Schedule reservation use case', () => {
    it('should schedule a reservation', async () => {
        const schedulesRepository = SchedulesMockRepository();
        const reservationsRepository = ReservationsMockRepository();
        const booksRepository = BooksMockRepository();
        const usersRepository = UsersMockRepository();

        const scheduleReservationUseCase = new CreateReservationScheduleUseCase(
            schedulesRepository,
            reservationsRepository,
            booksRepository,
            usersRepository,
        );

        vi.spyOn(booksRepository, 'removeBookFromStock');

        const result = await scheduleReservationUseCase.execute(schedule);

        expect(result.isRight()).toBe(true);
        expect(booksRepository.removeBookFromStock).toHaveBeenCalledWith(
            '1',
            1,
        );
        expect(result.value).toEqual({
            id: expect.any(String),
            date: schedule.date,
            userId: schedule.userId,
            scheduleItems: [
                expect.objectContaining({
                    id: expect.any(String),
                    bookId: schedule.scheduleItems[0].bookId,
                    name: schedule.scheduleItems[0].name,
                }),
            ],
            status: expect.any(String),
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
        });
    });

    it('should return a message error when a user does not exists', async () => {
        const schedulesRepository = SchedulesMockRepository();
        const reservationsRepository = ReservationsMockRepository();
        const booksRepository = BooksMockRepository();
        const usersRepository = UsersMockRepository();

        usersRepository.findById.mockReturnValue(Promise.resolve(null));

        const scheduleReservationUseCase = new CreateReservationScheduleUseCase(
            schedulesRepository,
            reservationsRepository,
            booksRepository,
            usersRepository,
        );

        const result = await scheduleReservationUseCase.execute(schedule);

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(UserDoesNotExistsError);
    });

    it('should return a message error when a book does not exists', async () => {
        const schedulesRepository = SchedulesMockRepository();
        const reservationsRepository = ReservationsMockRepository();
        const booksRepository = BooksMockRepository();
        const usersRepository = UsersMockRepository();

        booksRepository.findMany.mockReturnValue(Promise.resolve([]));

        const scheduleReservationUseCase = new CreateReservationScheduleUseCase(
            schedulesRepository,
            reservationsRepository,
            booksRepository,
            usersRepository,
        );

        const result = await scheduleReservationUseCase.execute(schedule);

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(BookDoesNotExistsError);
    });

    it('should return a message error when a book is not available', async () => {
        const schedulesRepository = SchedulesMockRepository();
        const reservationsRepository = ReservationsMockRepository();
        const booksRepository = BooksMockRepository();
        const usersRepository = UsersMockRepository();

        const book = [
            new Book(
                {
                    name: 'Book 1',
                    authors: [new BookAuthors('1', 'Author 1')],
                    publisher: new BookPublisher('1', 'Publisher 1'),
                    edition: new BookEdition(3, 'Book 1 description', 2023),
                    quantity: 3,
                    available: 0,
                    pages: 200,
                },
                '1',
            ),
        ];

        booksRepository.findMany.mockReturnValue(Promise.resolve(book));

        const scheduleReservationUseCase = new CreateReservationScheduleUseCase(
            schedulesRepository,
            reservationsRepository,
            booksRepository,
            usersRepository,
        );

        const result = await scheduleReservationUseCase.execute(schedule);

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(BookNotAvailableError);
    });

    it('should return a message error when a reservation has a deadline of more than 5 working days', async () => {
        const schedulesRepository = SchedulesMockRepository();
        const reservationsRepository = ReservationsMockRepository();
        const booksRepository = BooksMockRepository();
        const usersRepository = UsersMockRepository();

        const scheduleWithDeadlineProblem = {
            date: new Date(2999, 0, 1),
            userId: '1',
            scheduleItems: [
                {
                    bookId: '1',
                    name: 'Book 1',
                },
            ],
        };

        const scheduleReservationUseCase = new CreateReservationScheduleUseCase(
            schedulesRepository,
            reservationsRepository,
            booksRepository,
            usersRepository,
        );

        const result = await scheduleReservationUseCase.execute(
            scheduleWithDeadlineProblem,
        );

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(ScheduleDeadlineError);
    });

    it('should return a message error when user will exceed the reservation limit', async () => {
        const schedulesRepository = SchedulesMockRepository();
        const reservationsRepository = ReservationsMockRepository();
        const booksRepository = BooksMockRepository();
        const usersRepository = UsersMockRepository();

        const reservation = new Reservation(
            {
                userId: '1',
                reservationItem: [
                    new ReservationItem(
                        '3',
                        'Book 3',
                        new Date(),
                        false,
                        false,
                    ),
                    new ReservationItem(
                        '4',
                        'Book 4',
                        new Date(),
                        false,
                        false,
                    ),
                    new ReservationItem(
                        '5',
                        'Book 5',
                        new Date(),
                        false,
                        false,
                    ),
                ],
            },
            '1',
        );

        reservationsRepository.findByUserId.mockReturnValue(
            Promise.resolve([reservation]),
        );

        const scheduleReservationUseCase = new CreateReservationScheduleUseCase(
            schedulesRepository,
            reservationsRepository,
            booksRepository,
            usersRepository,
        );

        const result = await scheduleReservationUseCase.execute(schedule);

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(ReserveLimitError);
    });

    it('should return a message error when user try to reserve the same book more than two times at the last 30 days', async () => {
        const schedulesRepository = SchedulesMockRepository();
        const reservationsRepository = ReservationsMockRepository();
        const booksRepository = BooksMockRepository();
        const usersRepository = UsersMockRepository();

        const schedulesWithMoreThanTwoTimesProblem = [
            new Schedule({
                date: new Date(),
                userId: '1',
                scheduleItems: [new ScheduleItem('1', 'Book 1')],
                status: ScheduleStatus.canceled,
            }),
            new Schedule({
                date: new Date(),
                userId: '1',
                scheduleItems: [new ScheduleItem('1', 'Book 1')],
                status: ScheduleStatus.pending,
            }),
        ];

        schedulesRepository.findByUserIdAndLastDays.mockReturnValue(
            Promise.resolve(schedulesWithMoreThanTwoTimesProblem),
        );

        const scheduleReservationUseCase = new CreateReservationScheduleUseCase(
            schedulesRepository,
            reservationsRepository,
            booksRepository,
            usersRepository,
        );

        const result = await scheduleReservationUseCase.execute(schedule);

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(ScheduleLimitOfSameBookError);
    });
});
