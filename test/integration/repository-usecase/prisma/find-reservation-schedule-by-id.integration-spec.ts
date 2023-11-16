import { PrismaService } from '@infra/database/prisma/prisma.service';
import { PrismaSchedulesRepository } from '@infra/database/prisma/repositories/prisma-schedule-repository';
import { FindReservationScheduleByIdUseCase } from '@usecase/find-reservation-schedule-by-id/find-reservation-schedule-by-id';
import {
    startEnvironment,
    stopEnvironment,
} from 'test/utils/test-environment-setup';

let prisma: PrismaService;
let schedulesRepository: PrismaSchedulesRepository;
let findReservationScheduleByIdUseCase: FindReservationScheduleByIdUseCase;

describe('[IT] - Find reservation schedule by id', () => {
    beforeEach(() => {
        prisma = new PrismaService();
        startEnvironment();
        schedulesRepository = new PrismaSchedulesRepository(prisma);
        findReservationScheduleByIdUseCase =
            new FindReservationScheduleByIdUseCase(schedulesRepository);
    });

    afterEach(async () => {
        await stopEnvironment(prisma);
    });

    it('should find a reservation schedule by id', async () => {
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

        const result = await findReservationScheduleByIdUseCase.execute({
            id: '1',
        });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toEqual({
            id: expect.any(String),
            date: expect.any(Date),
            userId: '1',
            scheduleItems: [
                expect.objectContaining({
                    id: expect.any(String),
                    bookId: '1',
                    name: 'Book 1',
                }),
            ],
            status: expect.any(String),
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
        });
    });

    it('should return null when schedule is not found', async () => {
        const result = await findReservationScheduleByIdUseCase.execute({
            id: '1',
        });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toBeNull();
    });
});
