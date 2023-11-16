import { PrismaService } from '@infra/database/prisma/prisma.service';
import { PrismaReservationsRepository } from '@infra/database/prisma/repositories/prisma-reservations-repository';
import { FindReservationByIdUseCase } from '@usecase/find-reservation-by-id/find-reservation-by-id';
import {
    startEnvironment,
    stopEnvironment,
} from 'test/utils/test-environment-setup';

let prisma: PrismaService;
let reservationsRepository: PrismaReservationsRepository;
let findReservationByIdUseCase: FindReservationByIdUseCase;

describe('[IT] - Find reservation by id', () => {
    beforeEach(() => {
        prisma = new PrismaService();
        startEnvironment();
        reservationsRepository = new PrismaReservationsRepository(prisma);
        findReservationByIdUseCase = new FindReservationByIdUseCase(
            reservationsRepository,
        );
    });

    afterEach(async () => {
        await stopEnvironment(prisma);
    });

    it('should find a reservation by id', async () => {
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

        const result = await findReservationByIdUseCase.execute({
            id: '1',
        });

        expect(result.isRight()).toBeTruthy();
        expect(result.value?.id).toBe('1');
        expect(result.value?.userId).toBe('1');
    });

    it('should return null when a reservation is not find', async () => {
        const result = await findReservationByIdUseCase.execute({ id: '1' });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toBeNull();
    });
});
