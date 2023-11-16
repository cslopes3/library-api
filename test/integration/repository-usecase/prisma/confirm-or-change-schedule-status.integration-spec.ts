import { PrismaService } from '@infra/database/prisma/prisma.service';
import { PrismaBooksRepository } from '@infra/database/prisma/repositories/prisma-books-repository';
import { PrismaReservationsRepository } from '@infra/database/prisma/repositories/prisma-reservations-repository';
import { PrismaSchedulesRepository } from '@infra/database/prisma/repositories/prisma-schedule-repository';
import { ConfirmOrChangeScheduleStatusUseCase } from '@usecase/confirm-or-change-schedule-status/confirm-or-change-schedule-status';
import {
    startEnvironment,
    stopEnvironment,
} from 'test/utils/test-environment-setup';

let prisma: PrismaService;
let schedulesRepository: PrismaSchedulesRepository;
let reservationsRepository: PrismaReservationsRepository;
let booksRepository: PrismaBooksRepository;
let confirmOrChangeScheduleStatusUseCase: ConfirmOrChangeScheduleStatusUseCase;

describe('[IT] - Confirm or change status', () => {
    beforeEach(() => {
        prisma = new PrismaService();
        startEnvironment();
        schedulesRepository = new PrismaSchedulesRepository(prisma);
        reservationsRepository = new PrismaReservationsRepository(prisma);
        booksRepository = new PrismaBooksRepository(prisma);

        confirmOrChangeScheduleStatusUseCase =
            new ConfirmOrChangeScheduleStatusUseCase(
                schedulesRepository,
                reservationsRepository,
                booksRepository,
            );
    });

    afterEach(async () => {
        await stopEnvironment(prisma);
    });

    it('should be able to change status', async () => {
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
                publisherId: '1',
                editionNumber: 3,
                editionDescription: 'Book 1 description',
                editionYear: 2023,
                quantity: 3,
                available: 1,
                pages: 200,
            },
        });

        await prisma.schedule.create({
            data: {
                id: '1',
                date: new Date(),
                userId: '1',
                scheduleItems: {
                    create: [
                        {
                            id: '1',
                            bookId: '1',
                            name: 'Book 1',
                        },
                    ],
                },
                status: 'pending',
            },
        });

        vi.spyOn(booksRepository, 'addBookToStock');

        const result = await confirmOrChangeScheduleStatusUseCase.execute({
            id: '1',
            status: 'canceled',
        });

        expect(result.isRight()).toBeTruthy();
        expect(booksRepository.addBookToStock).toHaveBeenCalledOnce();
    });

    it('should be able to confirm a schedule', async () => {
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
                publisherId: '1',
                editionNumber: 3,
                editionDescription: 'Book 1 description',
                editionYear: 2023,
                quantity: 3,
                available: 1,
                pages: 200,
            },
        });

        await prisma.schedule.create({
            data: {
                id: '1',
                date: new Date(),
                userId: '1',
                scheduleItems: {
                    create: [
                        {
                            id: '1',
                            bookId: '1',
                            name: 'Book 1',
                        },
                    ],
                },
                status: 'pending',
            },
        });

        vi.spyOn(reservationsRepository, 'create');

        const result = await confirmOrChangeScheduleStatusUseCase.execute({
            id: '1',
            status: 'finished',
        });

        expect(result.isRight()).toBeTruthy();
        expect(reservationsRepository.create).toHaveBeenCalledWith(
            expect.objectContaining({
                userId: '1',
                reservationItem: [
                    expect.objectContaining({
                        bookId: '1',
                        name: 'Book 1',
                        expirationDate: expect.any(Date),
                    }),
                ],
            }),
        );
    });
});
