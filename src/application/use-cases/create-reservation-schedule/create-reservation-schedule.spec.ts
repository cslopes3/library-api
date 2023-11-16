import { ScheduleStatus } from '@domain/entities/schedule';
import { ReservationItem } from '@domain/value-objects/resevation-item';
import { ScheduleItem } from '@domain/value-objects/schedule-item';
import { BookDoesNotExistsError } from '@usecase/@errors/book-does-not-exists-error';
import { BookNotAvailableError } from '@usecase/@errors/book-not-available-error';
import { ReserveLimitError } from '@usecase/@errors/reserve-limit-error';
import { ScheduleDeadlineError } from '@usecase/@errors/schedule-deadline-error';
import { UserDoesNotExistsError } from '@usecase/@errors/user-does-not-exists-error';
import { CreateReservationScheduleUseCase } from './create-reservation-schedule';
import { ScheduleLimitOfSameBookError } from '@usecase/@errors/schedule-limit-of-same-book-error';
import { SchedulesMockRepository } from '@mocks/mock-schedules-repository';
import { ReservationsMockRepository } from '@mocks/mock-reservations-repository';
import { FakeBookFactory } from 'test/factories/fake-book-factory';
import { BooksMockRepository } from '@mocks/mock-books-repository';
import { FakeUserFactory } from 'test/factories/fake-user-factory';
import { FakeScheduleFactory } from 'test/factories/fake-schedule-factory';
import { UsersMockRepository } from '@mocks/mock-users-repository';
import { FakeReservationFactory } from 'test/factories/fake-reservation-factory';

let schedulesRepository: ReturnType<typeof SchedulesMockRepository>;
let reservationsRepository: ReturnType<typeof ReservationsMockRepository>;
let booksRepository: ReturnType<typeof BooksMockRepository>;
let usersRepository: ReturnType<typeof UsersMockRepository>;

describe('[UT] - Schedule reservation use case', () => {
    beforeEach(() => {
        schedulesRepository = SchedulesMockRepository();
        reservationsRepository = ReservationsMockRepository();
        booksRepository = BooksMockRepository();
        usersRepository = UsersMockRepository();
    });

    it('should schedule a reservation', async () => {
        const books = [FakeBookFactory.create()];
        const user = FakeUserFactory.create();
        const schedule = FakeScheduleFactory.create({
            userId: user.id.toString(),
            scheduleItems: [
                new ScheduleItem(books[0].id.toString(), books[0].name),
            ],
        });

        usersRepository.findById.mockResolvedValue(user);
        booksRepository.findMany.mockResolvedValue(books);
        schedulesRepository.findByUserIdAndLastDays.mockResolvedValue([]);
        reservationsRepository.findByUserId.mockResolvedValue([]);

        const scheduleReservationUseCase = new CreateReservationScheduleUseCase(
            schedulesRepository,
            reservationsRepository,
            booksRepository,
            usersRepository,
        );

        vi.spyOn(booksRepository, 'removeBookFromStock');

        const result = await scheduleReservationUseCase.execute({
            date: schedule.date,
            userId: schedule.userId,
            scheduleItems: schedule.scheduleItems.map((item) => ({
                bookId: item.bookId,
                name: item.name,
            })),
        });

        expect(result.isRight()).toBeTruthy();
        expect(booksRepository.removeBookFromStock).toHaveBeenCalledWith(
            books[0].id.toString(),
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
        const schedule = FakeScheduleFactory.create();

        const scheduleReservationUseCase = new CreateReservationScheduleUseCase(
            schedulesRepository,
            reservationsRepository,
            booksRepository,
            usersRepository,
        );

        const result = await scheduleReservationUseCase.execute({
            date: schedule.date,
            userId: schedule.userId,
            scheduleItems: schedule.scheduleItems.map((item) => ({
                bookId: item.bookId,
                name: item.name,
            })),
        });

        expect(result.isLeft()).toBeTruthy();
        expect(result.value).toBeInstanceOf(UserDoesNotExistsError);
    });

    it('should return a message error when a book does not exists', async () => {
        const user = FakeUserFactory.create();
        const schedule = FakeScheduleFactory.create({
            userId: user.id.toString(),
        });

        usersRepository.findById.mockResolvedValue(user);
        booksRepository.findMany.mockResolvedValue([]);

        const scheduleReservationUseCase = new CreateReservationScheduleUseCase(
            schedulesRepository,
            reservationsRepository,
            booksRepository,
            usersRepository,
        );

        const result = await scheduleReservationUseCase.execute({
            date: schedule.date,
            userId: schedule.userId,
            scheduleItems: schedule.scheduleItems.map((item) => ({
                bookId: item.bookId,
                name: item.name,
            })),
        });

        expect(result.isLeft()).toBeTruthy();
        expect(result.value).toBeInstanceOf(BookDoesNotExistsError);
    });

    it('should return a message error when a book is not available', async () => {
        const books = [FakeBookFactory.create({ available: 0 })];
        const user = FakeUserFactory.create();
        const schedule = FakeScheduleFactory.create({
            userId: user.id.toString(),
            scheduleItems: [
                new ScheduleItem(books[0].id.toString(), books[0].name),
            ],
        });

        usersRepository.findById.mockResolvedValue(user);
        booksRepository.findMany.mockResolvedValue(books);

        const scheduleReservationUseCase = new CreateReservationScheduleUseCase(
            schedulesRepository,
            reservationsRepository,
            booksRepository,
            usersRepository,
        );

        const result = await scheduleReservationUseCase.execute({
            date: schedule.date,
            userId: schedule.userId,
            scheduleItems: schedule.scheduleItems.map((item) => ({
                bookId: item.bookId,
                name: item.name,
            })),
        });

        expect(result.isLeft()).toBeTruthy();
        expect(result.value).toBeInstanceOf(BookNotAvailableError);
    });

    it('should return a message error when a reservation has a deadline of more than 5 working days', async () => {
        const books = [FakeBookFactory.create()];
        const user = FakeUserFactory.create();
        const scheduleWithDeadlineProblem = FakeScheduleFactory.create({
            userId: user.id.toString(),
            date: new Date(2999, 0, 1),
            scheduleItems: [
                new ScheduleItem(books[0].id.toString(), books[0].name),
            ],
        });

        usersRepository.findById.mockResolvedValue(user);
        booksRepository.findMany.mockResolvedValue(books);
        schedulesRepository.findByUserIdAndLastDays.mockResolvedValue([]);
        reservationsRepository.findByUserId.mockResolvedValue([]);

        const scheduleReservationUseCase = new CreateReservationScheduleUseCase(
            schedulesRepository,
            reservationsRepository,
            booksRepository,
            usersRepository,
        );

        const result = await scheduleReservationUseCase.execute({
            date: scheduleWithDeadlineProblem.date,
            userId: scheduleWithDeadlineProblem.userId,
            scheduleItems: scheduleWithDeadlineProblem.scheduleItems.map(
                (item) => ({
                    bookId: item.bookId,
                    name: item.name,
                }),
            ),
        });

        expect(result.isLeft()).toBeTruthy();
        expect(result.value).toBeInstanceOf(ScheduleDeadlineError);
    });

    it('should return a message error when user will exceed the reservation limit', async () => {
        const books = [
            FakeBookFactory.create(),
            FakeBookFactory.create({ name: 'Book 2' }, '2'),
        ];

        const reservationBooks = [
            FakeBookFactory.create({ name: 'Book 3' }, '3'),
            FakeBookFactory.create({ name: 'Book 4' }, '4'),
        ];

        const user = FakeUserFactory.create();

        const reservation = [
            FakeReservationFactory.create({
                userId: user.id.toString(),
                reservationItem: reservationBooks.map(
                    (book) =>
                        new ReservationItem(
                            book.id.toString(),
                            book.name,
                            new Date(),
                            false,
                            false,
                        ),
                ),
            }),
        ];

        const schedule = FakeScheduleFactory.create({
            userId: user.id.toString(),
            scheduleItems: books.map(
                (book) => new ScheduleItem(book.id.toString(), book.name),
            ),
        });

        usersRepository.findById.mockResolvedValue(user);
        booksRepository.findMany.mockResolvedValue(books);
        schedulesRepository.findByUserIdAndLastDays.mockResolvedValue([]);
        reservationsRepository.findByUserId.mockResolvedValue(reservation);

        const scheduleReservationUseCase = new CreateReservationScheduleUseCase(
            schedulesRepository,
            reservationsRepository,
            booksRepository,
            usersRepository,
        );

        const result = await scheduleReservationUseCase.execute({
            date: schedule.date,
            userId: schedule.userId,
            scheduleItems: schedule.scheduleItems.map((item) => ({
                bookId: item.bookId,
                name: item.name,
            })),
        });

        expect(result.isLeft()).toBeTruthy();
        expect(result.value).toBeInstanceOf(ReserveLimitError);
    });

    it('should return a message error when user try to reserve the same book more than two times at the last 30 days', async () => {
        const books = [FakeBookFactory.create()];
        const user = FakeUserFactory.create();
        const schedulesWithMoreThanTwoTimesProblem = [
            FakeScheduleFactory.create({
                userId: user.id.toString(),
                scheduleItems: [
                    new ScheduleItem(books[0].id.toString(), books[0].name),
                ],
                status: ScheduleStatus.canceled,
            }),
            FakeScheduleFactory.create({
                userId: user.id.toString(),
                scheduleItems: [
                    new ScheduleItem(books[0].id.toString(), books[0].name),
                ],
                status: ScheduleStatus.canceled,
            }),
        ];

        const schedule = FakeScheduleFactory.create({
            userId: user.id.toString(),
            scheduleItems: [
                new ScheduleItem(books[0].id.toString(), books[0].name),
            ],
        });

        usersRepository.findById.mockResolvedValue(user);
        booksRepository.findMany.mockResolvedValue(books);
        schedulesRepository.findByUserIdAndLastDays.mockResolvedValue(
            schedulesWithMoreThanTwoTimesProblem,
        );
        reservationsRepository.findByUserId.mockResolvedValue([]);

        const scheduleReservationUseCase = new CreateReservationScheduleUseCase(
            schedulesRepository,
            reservationsRepository,
            booksRepository,
            usersRepository,
        );

        const result = await scheduleReservationUseCase.execute({
            date: schedule.date,
            userId: schedule.userId,
            scheduleItems: schedule.scheduleItems.map((item) => ({
                bookId: item.bookId,
                name: item.name,
            })),
        });

        expect(result.isLeft()).toBeTruthy();
        expect(result.value).toBeInstanceOf(ScheduleLimitOfSameBookError);
    });
});
