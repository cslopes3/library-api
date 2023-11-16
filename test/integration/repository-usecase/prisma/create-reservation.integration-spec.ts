import { PrismaService } from '@infra/database/prisma/prisma.service';
import { PrismaBooksRepository } from '@infra/database/prisma/repositories/prisma-books-repository';
import { PrismaReservationsRepository } from '@infra/database/prisma/repositories/prisma-reservations-repository';
import { PrismaUsersRepository } from '@infra/database/prisma/repositories/prisma-users-repository';
import { CreateReservationUseCase } from '@usecase/create-reservation/create-reservation';
import {
    startEnvironment,
    stopEnvironment,
} from 'test/utils/test-environment-setup';

let prisma: PrismaService;
let reservationsRepository: PrismaReservationsRepository;
let booksRepository: PrismaBooksRepository;
let usersRepository: PrismaUsersRepository;
let createReservationUseCase: CreateReservationUseCase;

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
    });

    afterEach(async () => {
        await stopEnvironment(prisma);
    });

    it('should create a book reservation', async () => {
        await prisma.user.create({
            data: {
                id: '1',
                name: 'User 1',
                email: 'email@email.com',
                password: '1234',
            },
        });

        await prisma.publisher.create({
            data: {
                id: '1',
                name: 'Publisher 1',
            },
        });

        await prisma.author.create({
            data: {
                id: '1',
                name: 'Author 1',
            },
        });

        await prisma.book.create({
            data: {
                id: '1',
                name: 'Book 1',
                editionNumber: 1,
                editionDescription: 'Description',
                editionYear: 2023,
                quantity: 10,
                available: 10,
                pages: 100,
                publisherId: '1',
            },
        });

        const result = await createReservationUseCase.execute({
            userId: '1',
            reservationItems: [
                {
                    bookId: '1',
                    name: 'Book 1',
                },
            ],
        });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toEqual({
            id: expect.any(String),
            userId: '1',
            reservationItems: [
                expect.objectContaining({
                    id: expect.any(String),
                    bookId: '1',
                    name: 'Book 1',
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
