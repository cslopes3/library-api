import { ReservationItem } from '@domain/value-objects/resevation-item';
import { BookDoesNotExistsError } from '@usecase/@errors/book-does-not-exists-error';
import { CreateReservationUseCase } from './create-reservation';
import { UserDoesNotExistsError } from '@usecase/@errors/user-does-not-exists-error';
import { ReserveLimitError } from '@usecase/@errors/reserve-limit-error';
import { BookWithReturnDateExpiredError } from '@usecase/@errors/book-with-return-date-expired-error';
import { BookNotAvailableError } from '@usecase/@errors/book-not-available-error';
import { ReservationsMockRepository } from '@mocks/mock-reservations-repository';
import { FakeBookFactory } from 'test/factories/fake-book-factory';
import { BooksMockRepository } from '@mocks/mock-books-repository';
import { FakeUserFactory } from 'test/factories/fake-user-factory';
import { UsersMockRepository } from '@mocks/mock-users-repository';
import { FakeReservationFactory } from 'test/factories/fake-reservation-factory';

let reservationsRepository: ReturnType<typeof ReservationsMockRepository>;
let booksRepository: ReturnType<typeof BooksMockRepository>;
let usersRepository: ReturnType<typeof UsersMockRepository>;

describe('[UT] - Create reservation use case', () => {
    beforeEach(() => {
        reservationsRepository = ReservationsMockRepository();
        booksRepository = BooksMockRepository();
        usersRepository = UsersMockRepository();
    });

    it('should create a book reservation', async () => {
        const books = [
            FakeBookFactory.create(),
            FakeBookFactory.create({ name: 'Book 2' }, '2'),
        ];
        const user = FakeUserFactory.create();
        const reservation = FakeReservationFactory.create({
            userId: user.id.toString(),
            reservationItem: books.map(
                (book) =>
                    new ReservationItem(
                        book.id.toString(),
                        book.name,
                        new Date(),
                        false,
                        false,
                    ),
            ),
        });

        reservationsRepository.findByUserId.mockResolvedValue([]);
        booksRepository.findMany.mockResolvedValue(books);
        usersRepository.findById.mockResolvedValue(user);

        const createReservationUseCase = new CreateReservationUseCase(
            reservationsRepository,
            booksRepository,
            usersRepository,
        );

        const result = await createReservationUseCase.execute({
            userId: reservation.userId,
            reservationItems: [
                {
                    bookId: reservation.reservationItem[0].bookId,
                    name: reservation.reservationItem[0].name,
                },
                {
                    bookId: reservation.reservationItem[1].bookId,
                    name: reservation.reservationItem[1].name,
                },
            ],
        });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toEqual({
            id: expect.any(String),
            userId: reservation.userId,
            reservationItems: [
                expect.objectContaining({
                    id: expect.any(String),
                    bookId: reservation.reservationItem[0].bookId,
                    name: reservation.reservationItem[0].name,
                    expirationDate: expect.any(Date),
                    alreadyExtendTime: false,
                    returned: false,
                }),
                expect.objectContaining({
                    id: expect.any(String),
                    bookId: reservation.reservationItem[1].bookId,
                    name: reservation.reservationItem[1].name,
                    expirationDate: expect.any(Date),
                    alreadyExtendTime: false,
                    returned: false,
                }),
            ],
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
        });
    });

    it('should return a message error when a book does not exists', async () => {
        const user = FakeUserFactory.create();
        const reservation = FakeReservationFactory.create();

        reservationsRepository.findByUserId.mockResolvedValue([]);
        booksRepository.findMany.mockResolvedValue([]);
        usersRepository.findById.mockResolvedValue(user);

        const createReservationUseCase = new CreateReservationUseCase(
            reservationsRepository,
            booksRepository,
            usersRepository,
        );

        const result = await createReservationUseCase.execute({
            userId: reservation.userId,
            reservationItems: [
                {
                    bookId: reservation.reservationItem[0].id.toString(),
                    name: reservation.reservationItem[0].name,
                },
            ],
        });

        expect(result.isLeft()).toBeTruthy();
        expect(result.value).toBeInstanceOf(BookDoesNotExistsError);
    });

    it('should return a message error when a user does not exists', async () => {
        const reservation = FakeReservationFactory.create();

        reservationsRepository.findByUserId.mockResolvedValue([]);
        booksRepository.findMany.mockResolvedValue([]);
        usersRepository.findById.mockReturnValue(Promise.resolve(null));

        const createReservationUseCase = new CreateReservationUseCase(
            reservationsRepository,
            booksRepository,
            usersRepository,
        );

        const result = await createReservationUseCase.execute({
            userId: reservation.userId,
            reservationItems: [
                {
                    bookId: reservation.reservationItem[0].id.toString(),
                    name: reservation.reservationItem[0].name,
                },
            ],
        });

        expect(result.isLeft()).toBeTruthy();
        expect(result.value).toBeInstanceOf(UserDoesNotExistsError);
    });

    it('should return a message error when a user will reserve more than 3 books', async () => {
        const books = [
            FakeBookFactory.create(),
            FakeBookFactory.create({ name: 'Book 2' }, '2'),
            FakeBookFactory.create({ name: 'Book 3' }, '3'),
            FakeBookFactory.create({ name: 'Book 4' }, '4'),
        ];
        const user = FakeUserFactory.create();
        const reservationWithFourBooks = FakeReservationFactory.create({
            userId: user.id.toString(),
            reservationItem: books.map(
                (book) =>
                    new ReservationItem(
                        book.id.toString(),
                        book.name,
                        new Date(),
                        false,
                        false,
                    ),
            ),
        });

        reservationsRepository.findByUserId.mockResolvedValue([]);
        booksRepository.findMany.mockResolvedValue(books);
        usersRepository.findById.mockResolvedValue(user);

        const createReservationUseCase = new CreateReservationUseCase(
            reservationsRepository,
            booksRepository,
            usersRepository,
        );

        const result = await createReservationUseCase.execute({
            userId: reservationWithFourBooks.userId,
            reservationItems: reservationWithFourBooks.reservationItem.map(
                (item) => ({
                    bookId: item.bookId,
                    name: item.name,
                }),
            ),
        });

        expect(result.isLeft()).toBeTruthy();
        expect(result.value).toBeInstanceOf(ReserveLimitError);
    });

    it('should return a message error when a user will reserve a book and it will exceed the 3 books limit', async () => {
        const books = [
            FakeBookFactory.create(),
            FakeBookFactory.create({ name: 'Book 2' }, '2'),
        ];
        const user = FakeUserFactory.create();
        const reservation = FakeReservationFactory.create({
            userId: user.id.toString(),
            reservationItem: books.map(
                (book) =>
                    new ReservationItem(
                        book.id.toString(),
                        book.name,
                        new Date(),
                        false,
                        false,
                    ),
            ),
        });

        const alreadyReservedBooks = [
            FakeBookFactory.create({ name: 'Book 3' }, '3'),
            FakeBookFactory.create({ name: 'Book 4' }, '4'),
        ];

        const userReservations = [
            FakeReservationFactory.create({
                userId: user.id.toString(),
                reservationItem: alreadyReservedBooks.map(
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

        reservationsRepository.findByUserId.mockResolvedValue(userReservations);
        booksRepository.findMany.mockResolvedValue(books);
        usersRepository.findById.mockResolvedValue(user);

        const createReservationUseCase = new CreateReservationUseCase(
            reservationsRepository,
            booksRepository,
            usersRepository,
        );

        const result = await createReservationUseCase.execute({
            userId: reservation.userId,
            reservationItems: reservation.reservationItem.map((item) => ({
                bookId: item.bookId,
                name: item.name,
            })),
        });

        expect(result.isLeft()).toBeTruthy();
        expect(result.value).toBeInstanceOf(ReserveLimitError);
    });

    it('should return a message error when a user has a reservation with the return date expirated', async () => {
        const books = [FakeBookFactory.create()];
        const user = FakeUserFactory.create();
        const reservation = FakeReservationFactory.create({
            userId: user.id.toString(),
            reservationItem: books.map(
                (book) =>
                    new ReservationItem(
                        book.id.toString(),
                        book.name,
                        new Date(),
                        false,
                        false,
                    ),
            ),
        });

        const userReservations = [
            FakeReservationFactory.create({
                userId: user.id.toString(),
                reservationItem: books.map(
                    (book) =>
                        new ReservationItem(
                            book.id.toString(),
                            book.name,
                            new Date(2023, 0, 1),
                            false,
                            false,
                        ),
                ),
            }),
        ];

        reservationsRepository.findByUserId.mockResolvedValue(userReservations);
        booksRepository.findMany.mockResolvedValue(books);
        usersRepository.findById.mockResolvedValue(user);

        const createReservationUseCase = new CreateReservationUseCase(
            reservationsRepository,
            booksRepository,
            usersRepository,
        );

        const result = await createReservationUseCase.execute({
            userId: reservation.userId,
            reservationItems: reservation.reservationItem.map((item) => ({
                bookId: item.bookId,
                name: item.name,
            })),
        });

        expect(result.isLeft()).toBeTruthy();
        expect(result.value).toBeInstanceOf(BookWithReturnDateExpiredError);
    });

    it('should return a message error when a book is not available', async () => {
        const books = [FakeBookFactory.create({ available: 0 })];
        const user = FakeUserFactory.create();
        const reservation = FakeReservationFactory.create({
            userId: user.id.toString(),
            reservationItem: books.map(
                (book) =>
                    new ReservationItem(
                        book.id.toString(),
                        book.name,
                        new Date(),
                        false,
                        false,
                    ),
            ),
        });

        reservationsRepository.findByUserId.mockResolvedValue([]);
        booksRepository.findMany.mockResolvedValue(books);
        usersRepository.findById.mockResolvedValue(user);

        const createReservationUseCase = new CreateReservationUseCase(
            reservationsRepository,
            booksRepository,
            usersRepository,
        );

        const result = await createReservationUseCase.execute({
            userId: reservation.userId,
            reservationItems: reservation.reservationItem.map((item) => ({
                bookId: item.bookId,
                name: item.name,
            })),
        });

        expect(result.isLeft()).toBeTruthy();
        expect(result.value).toBeInstanceOf(BookNotAvailableError);
    });
});
