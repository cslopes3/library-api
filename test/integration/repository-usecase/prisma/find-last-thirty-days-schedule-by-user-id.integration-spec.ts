import { PrismaService } from '@infra/database/prisma/prisma.service';
import { PrismaSchedulesRepository } from '@infra/database/prisma/repositories/prisma-schedule-repository';
import { PrismaUsersRepository } from '@infra/database/prisma/repositories/prisma-users-repository';
import { FindLastThirtyScheduleByUserIdUseCase } from '@usecase/find-last-thirty-days-schedule-by-user-id/find-last-thirty-days-schedule-by-user-id';
import {
    startEnvironment,
    stopEnvironment,
} from 'test/utils/test-environment-setup';

let prisma: PrismaService;
let schedulesRepository: PrismaSchedulesRepository;
let usersRepository: PrismaUsersRepository;
let findLastThirtyScheduleByUserIdUseCase: FindLastThirtyScheduleByUserIdUseCase;

describe('[IT] - Find last thirty days schedule by user id', () => {
    beforeEach(() => {
        prisma = new PrismaService();
        startEnvironment();
        schedulesRepository = new PrismaSchedulesRepository(prisma);
        usersRepository = new PrismaUsersRepository(prisma);
        findLastThirtyScheduleByUserIdUseCase =
            new FindLastThirtyScheduleByUserIdUseCase(
                schedulesRepository,
                usersRepository,
            );
    });

    afterEach(async () => {
        await stopEnvironment(prisma);
    });

    it('should find a schedule by user id', async () => {
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

        const result = await findLastThirtyScheduleByUserIdUseCase.execute({
            userId: '1',
        });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toHaveLength(1);
    });

    it('should return an empty array when not found a schedule', async () => {
        await prisma.user.create({
            data: {
                id: '1',
                name: 'User 1',
                email: 'email@email.com',
                password: '1234',
            },
        });

        const result = await findLastThirtyScheduleByUserIdUseCase.execute({
            userId: '1',
        });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toHaveLength(0);
    });
});
