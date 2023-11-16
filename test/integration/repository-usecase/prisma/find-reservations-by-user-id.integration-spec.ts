import { PrismaService } from '@infra/database/prisma/prisma.service';
import { PrismaReservationsRepository } from '@infra/database/prisma/repositories/prisma-reservations-repository';
import { PrismaUsersRepository } from '@infra/database/prisma/repositories/prisma-users-repository';
import { FindReservationsByUserIdUseCase } from '@usecase/find-reservations-by-user-id/find-reservations-by-user-id';
import {
    startEnvironment,
    stopEnvironment,
} from 'test/utils/test-environment-setup';

let prisma: PrismaService;
let reservationsRepository: PrismaReservationsRepository;
let usersRepository: PrismaUsersRepository;
let findReservationsByUserIdUseCase: FindReservationsByUserIdUseCase;

describe('[IT] - Find reservation by user id', () => {
    beforeEach(() => {
        prisma = new PrismaService();
        startEnvironment();
        reservationsRepository = new PrismaReservationsRepository(prisma);
        usersRepository = new PrismaUsersRepository(prisma);
        findReservationsByUserIdUseCase = new FindReservationsByUserIdUseCase(
            reservationsRepository,
            usersRepository,
        );
    });

    afterEach(async () => {
        await stopEnvironment(prisma);
    });

    it('should find a reservation by user id', async () => {
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

        const result = await findReservationsByUserIdUseCase.execute({
            userId: '1',
        });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toHaveLength(1);
    });

    it('should return an empty array when not found a reservation', async () => {
        await prisma.user.create({
            data: {
                id: '1',
                name: 'User 1',
                email: 'email@email.com',
                password: '1234',
            },
        });

        const result = await findReservationsByUserIdUseCase.execute({
            userId: '1',
        });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toHaveLength(0);
    });
});
