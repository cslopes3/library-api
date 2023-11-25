import { BookPublisher } from '@domain/value-objects/book-publisher';
import { ScheduleItem } from '@domain/value-objects/schedule-item';
import { PrismaService } from '@infra/database/prisma/prisma.service';
import { PrismaSchedulesRepository } from '@infra/database/prisma/repositories/prisma-schedule-repository';
import { PrismaUsersRepository } from '@infra/database/prisma/repositories/prisma-users-repository';
import { FindLastThirtyScheduleByUserIdUseCase } from '@usecase/find-last-thirty-days-schedule-by-user-id/find-last-thirty-days-schedule-by-user-id';
import { PrismaFakeBook } from 'test/factories/fake-book-factory';
import { PrismaFakePublisher } from 'test/factories/fake-publisher-factory';
import { PrismaFakeSchedule } from 'test/factories/fake-schedule-factory';
import { PrismaFakeUser } from 'test/factories/fake-user-factory';
import {
    startEnvironment,
    stopEnvironment,
} from 'test/utils/test-environment-setup';

let prisma: PrismaService;
let schedulesRepository: PrismaSchedulesRepository;
let usersRepository: PrismaUsersRepository;
let findLastThirtyScheduleByUserIdUseCase: FindLastThirtyScheduleByUserIdUseCase;
let prismaFakeUser: PrismaFakeUser;
let prismaFakePublisher: PrismaFakePublisher;
let prismaFakeBook: PrismaFakeBook;
let prismaFakeSchedule: PrismaFakeSchedule;

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

        prismaFakeUser = new PrismaFakeUser(prisma);
        prismaFakePublisher = new PrismaFakePublisher(prisma);
        prismaFakeBook = new PrismaFakeBook(prisma);
        prismaFakeSchedule = new PrismaFakeSchedule(prisma);
    });

    afterEach(async () => {
        await stopEnvironment(prisma);
    });

    it('should find a schedule by user id', async () => {
        const user = await prismaFakeUser.create();
        const publisher = await prismaFakePublisher.create();
        const book = await prismaFakeBook.create({
            publisher: new BookPublisher(
                publisher.id.toString(),
                publisher.name,
            ),
            available: 1,
        });
        const schedule = await prismaFakeSchedule.create({
            userId: user.id.toString(),
            scheduleItems: [new ScheduleItem(book.id.toString(), book.name)],
        });

        const result = await findLastThirtyScheduleByUserIdUseCase.execute({
            userId: schedule.userId,
            currentUserId: user.id.toString(),
        });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toHaveLength(1);
    });

    it('should return an empty array when not found a schedule', async () => {
        const user = await prismaFakeUser.create();

        const result = await findLastThirtyScheduleByUserIdUseCase.execute({
            userId: user.id.toString(),
            currentUserId: user.id.toString(),
        });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toHaveLength(0);
    });
});
