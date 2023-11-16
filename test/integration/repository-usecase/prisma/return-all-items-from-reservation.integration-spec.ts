import { PrismaService } from '@infra/database/prisma/prisma.service';
import { PrismaBooksRepository } from '@infra/database/prisma/repositories/prisma-books-repository';
import { PrismaReservationsRepository } from '@infra/database/prisma/repositories/prisma-reservations-repository';
import { ReturnAllItemsFromReservationUseCase } from '@usecase/return-all-items-from-reservation/return-all-items-from-reservation';
import {
    startEnvironment,
    stopEnvironment,
} from 'test/utils/test-environment-setup';

let prisma: PrismaService;
let booksRepository: PrismaBooksRepository;
let reservationsRepository: PrismaReservationsRepository;
let returnAllItemsFromReservationUseCase: ReturnAllItemsFromReservationUseCase;

describe('[IT] - Return all items from reservation', () => {
    beforeEach(() => {
        prisma = new PrismaService();
        startEnvironment();
        reservationsRepository = new PrismaReservationsRepository(prisma);
        booksRepository = new PrismaBooksRepository(prisma);
        returnAllItemsFromReservationUseCase =
            new ReturnAllItemsFromReservationUseCase(
                reservationsRepository,
                booksRepository,
            );
    });

    afterEach(async () => {
        await stopEnvironment(prisma);
    });

    it('should return all items from reservation', async () => {
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

        await prisma.reservation.create({
            data: {
                id: '1',
                userId: '1',
                reservationItems: {
                    create: [
                        {
                            id: '1',
                            bookId: '1',
                            name: 'Book 1',
                            expirationDate: new Date(),
                            alreadyExtendTime: false,
                            returned: false,
                        },
                    ],
                },
            },
        });

        const result = await returnAllItemsFromReservationUseCase.execute({
            id: '1',
        });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toEqual({
            id: '1',
            userId: '1',
            reservationItems: [
                expect.objectContaining({
                    id: expect.any(String),
                    bookId: '1',
                    name: 'Book 1',
                    expirationDate: expect.any(Date),
                    alreadyExtendTime: expect.any(Boolean),
                    returned: true,
                    returnDate: expect.any(Date),
                }),
            ],
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
        });
    });
});
