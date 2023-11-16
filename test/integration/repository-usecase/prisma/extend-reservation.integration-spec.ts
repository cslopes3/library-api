import { PrismaService } from '@infra/database/prisma/prisma.service';
import { PrismaReservationsRepository } from '@infra/database/prisma/repositories/prisma-reservations-repository';
import { ExtendReservationUseCase } from '@usecase/extend-reservation/extend-reservation';
import {
    startEnvironment,
    stopEnvironment,
} from 'test/utils/test-environment-setup';

let prisma: PrismaService;
let reservationsRepository: PrismaReservationsRepository;
let extendReservationUseCase: ExtendReservationUseCase;

describe('[IT] - Extend reservation ', () => {
    beforeEach(() => {
        prisma = new PrismaService();
        startEnvironment();
        reservationsRepository = new PrismaReservationsRepository(prisma);
        extendReservationUseCase = new ExtendReservationUseCase(
            reservationsRepository,
        );
    });

    afterEach(async () => {
        await stopEnvironment(prisma);
    });

    it('should extend the reservation period', async () => {
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
                available: 9,
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

        const result = await extendReservationUseCase.execute({
            id: '1',
        });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toEqual({
            id: '1',
            userId: '1',
            reservationItems: [
                expect.objectContaining({
                    id: expect.any(String),
                    expirationDate: expect.any(Date),
                    alreadyExtendTime: true,
                    returned: false,
                }),
            ],
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
        });
    });
});
