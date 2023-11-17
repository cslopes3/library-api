import { BookPublisher } from '@domain/value-objects/book-publisher';
import { PrismaService } from '@infra/database/prisma/prisma.service';
import { PrismaBooksRepository } from '@infra/database/prisma/repositories/prisma-books-repository';
import { PrismaReservationsRepository } from '@infra/database/prisma/repositories/prisma-reservations-repository';
import { PrismaUsersRepository } from '@infra/database/prisma/repositories/prisma-users-repository';
import { CreateReservationUseCase } from '@usecase/create-reservation/create-reservation';
import { PrismaFakeBook } from 'test/factories/fake-book-factory';
import { PrismaFakePublisher } from 'test/factories/fake-publisher-factory';
import { PrismaFakeUser } from 'test/factories/fake-user-factory';
import {
    startEnvironment,
    stopEnvironment,
} from 'test/utils/test-environment-setup';

let prisma: PrismaService;
let reservationsRepository: PrismaReservationsRepository;
let booksRepository: PrismaBooksRepository;
let usersRepository: PrismaUsersRepository;
let createReservationUseCase: CreateReservationUseCase;
let prismaFakeUser: PrismaFakeUser;
let prismaFakePublisher: PrismaFakePublisher;
let prismaFakeBook: PrismaFakeBook;

describe('[IT] - Create reservation', () => {
    beforeEach(() => {
        prisma = new PrismaService();
        startEnvironment();
        reservationsRepository = new PrismaReservationsRepository(prisma);
        booksRepository = new PrismaBooksRepository(prisma);
        usersRepository = new PrismaUsersRepository(prisma);
        createReservationUseCase = new CreateReservationUseCase(
            reservationsRepository,
            booksRepository,
            usersRepository,
        );

        prismaFakeUser = new PrismaFakeUser(prisma);
        prismaFakePublisher = new PrismaFakePublisher(prisma);
        prismaFakeBook = new PrismaFakeBook(prisma);
    });

    afterEach(async () => {
        await stopEnvironment(prisma);
    });

    it('should create a book reservation', async () => {
        const user = await prismaFakeUser.create();
        const publisher = await prismaFakePublisher.create();
        const book = await prismaFakeBook.create({
            publisher: new BookPublisher(
                publisher.id.toString(),
                publisher.name,
            ),
        });

        const result = await createReservationUseCase.execute({
            userId: user.id.toString(),
            reservationItems: [
                {
                    bookId: book.id.toString(),
                    name: book.name,
                },
            ],
        });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toEqual({
            id: expect.any(String),
            userId: user.id.toString(),
            reservationItems: [
                expect.objectContaining({
                    id: expect.any(String),
                    bookId: book.id.toString(),
                    name: book.name,
                    expirationDate: expect.any(Date),
                    alreadyExtendTime: false,
                    returned: false,
                }),
            ],
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
        });
    });
});
