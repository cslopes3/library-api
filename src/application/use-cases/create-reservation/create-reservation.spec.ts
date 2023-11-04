import { Book } from '@domain/entities/book';
import { Reservation } from '@domain/entities/reservation';
import { User } from '@domain/entities/user';
import { BookAuthors } from '@domain/value-objects/book-authors';
import { BookEdition } from '@domain/value-objects/book-edition';
import { BookPublisher } from '@domain/value-objects/book-publisher';
import { ReservationItem } from '@domain/value-objects/resevation-item';
import { BookDoesNotExistsError } from '@usecase/@errors/book-does-not-exists-error';
import { CreateReservationUseCase } from './create-reservation';
import { UserDoesNotExistsError } from '@usecase/@errors/user-does-not-exists-error';
import { ReserveLimitError } from '@usecase/@errors/reserve-limit-error';
import { BookWithReturnDateExpiredError } from '@usecase/@errors/book-with-return-date-expired-error';
import { BookNotAvailableError } from '@usecase/@errors/book-not-available-error';

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

const books = [
    new Book({
        name: 'Book 1',
        authors: [new BookAuthors('1', 'Author 1')],
        publisher: new BookPublisher('1', 'Publisher 1'),
        edition: new BookEdition(3, 'Book 1 description', 2023),
        quantity: 3,
        available: 3,
        pages: 200,
    }),
    new Book({
        name: 'Book 2',
        authors: [new BookAuthors('1', 'Author 1')],
        publisher: new BookPublisher('1', 'Publisher 1'),
        edition: new BookEdition(3, 'Book 1 description', 2023),
        quantity: 3,
        available: 3,
        pages: 200,
    }),
];

const BooksMockRepository = () => {
    return {
        findById: vi.fn(),
        findByName: vi.fn(),
        findMany: vi.fn().mockReturnValue(Promise.resolve(books)),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        addBookToStock: vi.fn(),
        removeBookFromStock: vi.fn(),
    };
};

const user = new User({
    name: 'Name 1',
    email: 'email@email.com',
    password: '123456',
});

const UsersMockRepository = () => {
    return {
        findById: vi.fn().mockReturnValue(Promise.resolve(user)),
        findByEmail: vi.fn(),
        create: vi.fn(),
    };
};

const reservation = {
    userId: '1',
    reservationItems: [
        {
            bookId: '1',
            name: 'Book 1',
        },
        {
            bookId: '2',
            name: 'Book 2',
        },
    ],
};

describe('[UT] - Create reservation use case', () => {
    it('should create a book reservation', async () => {
        const reservationsRepository = ReservationsMockRepository();
        const booksRepository = BooksMockRepository();
        const usersRepository = UsersMockRepository();
        const createReservationUseCase = new CreateReservationUseCase(
            reservationsRepository,
            booksRepository,
            usersRepository,
        );

        const result = await createReservationUseCase.execute(reservation);

        expect(result.isRight()).toBe(true);
        expect(result.value).toEqual({
            id: expect.any(String),
            userId: reservation.userId,
            reservationItems: [
                expect.objectContaining({
                    id: expect.any(String),
                    bookId: reservation.reservationItems[0].bookId,
                    name: reservation.reservationItems[0].name,
                    expirationDate: expect.any(Date),
                    alreadyExtendTime: false,
                    returned: false,
                }),
                expect.objectContaining({
                    id: expect.any(String),
                    bookId: reservation.reservationItems[1].bookId,
                    name: reservation.reservationItems[1].name,
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
        const reservationsRepository = ReservationsMockRepository();
        const booksRepository = BooksMockRepository();
        const usersRepository = UsersMockRepository();

        booksRepository.findMany.mockReturnValue(Promise.resolve([]));

        const createReservationUseCase = new CreateReservationUseCase(
            reservationsRepository,
            booksRepository,
            usersRepository,
        );

        const result = await createReservationUseCase.execute(reservation);

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(BookDoesNotExistsError);
    });

    it('should return a message error when a user does not exists', async () => {
        const reservationsRepository = ReservationsMockRepository();
        const booksRepository = BooksMockRepository();
        const usersRepository = UsersMockRepository();

        usersRepository.findById.mockReturnValue(Promise.resolve(null));

        const createReservationUseCase = new CreateReservationUseCase(
            reservationsRepository,
            booksRepository,
            usersRepository,
        );

        const result = await createReservationUseCase.execute(reservation);

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(UserDoesNotExistsError);
    });

    it('should return a message error when a user will reserve more than 3 books', async () => {
        const reservationsRepository = ReservationsMockRepository();
        const booksRepository = BooksMockRepository();
        const usersRepository = UsersMockRepository();

        const arrayWithFourBooks = [
            new Book({
                name: 'Book 1',
                authors: [new BookAuthors('1', 'Author 1')],
                publisher: new BookPublisher('1', 'Publisher 1'),
                edition: new BookEdition(3, 'Book 1 description', 2023),
                quantity: 3,
                available: 3,
                pages: 200,
            }),
            new Book({
                name: 'Book 2',
                authors: [new BookAuthors('1', 'Author 1')],
                publisher: new BookPublisher('1', 'Publisher 1'),
                edition: new BookEdition(3, 'Book 1 description', 2023),
                quantity: 3,
                available: 3,
                pages: 200,
            }),
            new Book({
                name: 'Book 3',
                authors: [new BookAuthors('1', 'Author 1')],
                publisher: new BookPublisher('1', 'Publisher 1'),
                edition: new BookEdition(3, 'Book 3 description', 2023),
                quantity: 3,
                available: 3,
                pages: 200,
            }),
            new Book({
                name: 'Book 4',
                authors: [new BookAuthors('1', 'Author 1')],
                publisher: new BookPublisher('1', 'Publisher 1'),
                edition: new BookEdition(3, 'Book 4 description', 2023),
                quantity: 3,
                available: 3,
                pages: 200,
            }),
        ];

        booksRepository.findMany.mockReturnValue(
            Promise.resolve(arrayWithFourBooks),
        );

        const createReservationUseCase = new CreateReservationUseCase(
            reservationsRepository,
            booksRepository,
            usersRepository,
        );

        const reservationWith4Books = {
            userId: '1',
            reservationItems: [
                {
                    bookId: '1',
                    name: 'Book 1',
                },
                {
                    bookId: '2',
                    name: 'Book 2',
                },
                {
                    bookId: '3',
                    name: 'Book 3',
                },
                {
                    bookId: '4',
                    name: 'Book 4',
                },
            ],
        };

        const result = await createReservationUseCase.execute(
            reservationWith4Books,
        );

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(ReserveLimitError);
    });

    it('should return a message error when a user will reserve a book and it will exceed the 3 books limit', async () => {
        const reservationsRepository = ReservationsMockRepository();
        const booksRepository = BooksMockRepository();
        const usersRepository = UsersMockRepository();

        const userReservations = [
            new Reservation({
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
                ],
            }),
        ];

        reservationsRepository.findByUserId.mockReturnValue(
            Promise.resolve(userReservations),
        );

        const createReservationUseCase = new CreateReservationUseCase(
            reservationsRepository,
            booksRepository,
            usersRepository,
        );

        const result = await createReservationUseCase.execute(reservation);

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(ReserveLimitError);
    });

    it('should return a message error when a user has a reservation with the return date expirated', async () => {
        const reservationsRepository = ReservationsMockRepository();
        const booksRepository = BooksMockRepository();
        const usersRepository = UsersMockRepository();

        const userReservations = [
            new Reservation({
                userId: '1',
                reservationItem: [
                    new ReservationItem(
                        '3',
                        'Book 3',
                        new Date(2023, 0, 1),
                        false,
                        false,
                    ),
                ],
            }),
        ];

        reservationsRepository.findByUserId.mockReturnValue(
            Promise.resolve(userReservations),
        );

        const createReservationUseCase = new CreateReservationUseCase(
            reservationsRepository,
            booksRepository,
            usersRepository,
        );

        const result = await createReservationUseCase.execute(reservation);

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(BookWithReturnDateExpiredError);
    });

    it('should return a message error when a book is not available', async () => {
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
            new Book(
                {
                    name: 'Book 2',
                    authors: [new BookAuthors('1', 'Author 1')],
                    publisher: new BookPublisher('1', 'Publisher 1'),
                    edition: new BookEdition(3, 'Book 1 description', 2023),
                    quantity: 3,
                    available: 3,
                    pages: 200,
                },
                '2',
            ),
        ];

        booksRepository.findMany.mockReturnValue(Promise.resolve(book));

        const createReservationUseCase = new CreateReservationUseCase(
            reservationsRepository,
            booksRepository,
            usersRepository,
        );

        const result = await createReservationUseCase.execute(reservation);

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(BookNotAvailableError);
    });
});
