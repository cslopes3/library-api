import {
    startEnvironment,
    stopEnvironment,
} from 'test/utils/test-environment-setup';
import { PrismaService } from '../prisma.service';
import { SchedulesRepository } from '@repository/schedules-repository';
import { PrismaSchedulesRepository } from './prisma-schedule-repository';
import {
    PrismaFakeSchedule,
    createFakeSchedule,
} from 'test/factories/fake-schedule-factory';
import { PrismaFakeBook } from 'test/factories/fake-book-factory';
import { PrismaFakeAuthor } from 'test/factories/fake-author-factory';
import { PrismaFakePublisher } from 'test/factories/fake-publisher-factory';
import { BookAuthors } from '@domain/value-objects/book-authors';
import { BookPublisher } from '@domain/value-objects/book-publisher';
import { ScheduleItem } from '@domain/value-objects/schedule-item';
import { PrismaFakeUser } from 'test/factories/fake-user-factory';
import { Schedule } from '@domain/entities/schedule';

let prisma: PrismaService;
let schedulesRepository: SchedulesRepository;
let prismaFakeUser: PrismaFakeUser;
let prismaFakePublisher: PrismaFakePublisher;
let prismaFakeAuthor: PrismaFakeAuthor;
let prismaFakeBook: PrismaFakeBook;
let prismaFakeSchedule: PrismaFakeSchedule;

describe('[UT] - Schedules repository', () => {
    beforeEach(() => {
        prisma = new PrismaService();
        startEnvironment();
        schedulesRepository = new PrismaSchedulesRepository(prisma);

        prismaFakeUser = new PrismaFakeUser(prisma);
        prismaFakePublisher = new PrismaFakePublisher(prisma);
        prismaFakeAuthor = new PrismaFakeAuthor(prisma);
        prismaFakeBook = new PrismaFakeBook(prisma);
        prismaFakeSchedule = new PrismaFakeSchedule(prisma);
    });

    afterEach(async () => {
        await stopEnvironment(prisma);
    });

    it('should create a schedule', async () => {
        const user = await prismaFakeUser.create();
        const publisher = await prismaFakePublisher.create();
        const author = await prismaFakeAuthor.create();
        const book = await prismaFakeBook.create({
            publisher: new BookPublisher(
                publisher.id.toString(),
                publisher.name,
            ),
            authors: [new BookAuthors(author.id.toString(), author.name)],
        });

        const schedule = await createFakeSchedule({
            userId: user.id.toString(),
            scheduleItems: [new ScheduleItem(book.id.toString(), book.name)],
        });

        vi.spyOn(prisma.schedule, 'create');

        await schedulesRepository.create(schedule);

        expect(prisma.schedule.create).toHaveBeenCalledWith({
            data: {
                id: schedule.id.toString(),
                date: schedule.date,
                userId: schedule.userId,
                scheduleItems: {
                    create: schedule.scheduleItems.map((item) => ({
                        id: item.id.toString(),
                        bookId: item.bookId,
                        name: item.name,
                    })),
                },
                status: schedule.status,
            },
        });
    });

    it('should find a schedule by id', async () => {
        const schedule = await createScheduleSetup();

        const result = await schedulesRepository.findById(
            schedule.id.toString(),
        );

        expect(result?.id).toEqual(schedule.id);
        expect(result?.date).toEqual(schedule.date);
        expect(result?.status).toEqual(schedule.status);
    });

    it('should find schedules by user id and last days', async () => {
        const schedule = await createScheduleSetup();

        const result = await schedulesRepository.findByUserIdAndLastDays(
            schedule.userId,
            schedule.date,
        );

        expect(result[0]?.id).toEqual(schedule.id);
        expect(result[0]?.date).toEqual(schedule.date);
        expect(result[0]?.status).toEqual(schedule.status);
    });

    it('should change schedule status', async () => {
        const schedule = await createScheduleSetup();

        vi.spyOn(prisma.schedule, 'update');
        const newStatus = 'canceled';

        await schedulesRepository.changeStatus(
            schedule.id.toString(),
            newStatus,
        );

        expect(prisma.schedule.update).toHaveBeenCalledWith({
            data: {
                status: newStatus,
            },
            where: {
                id: schedule.id.toString(),
            },
        });
    });
});

async function createScheduleSetup(): Promise<Schedule> {
    const user = await prismaFakeUser.create();
    const publisher = await prismaFakePublisher.create();
    const author = await prismaFakeAuthor.create();
    const book = await prismaFakeBook.create({
        publisher: new BookPublisher(publisher.id.toString(), publisher.name),
        authors: [new BookAuthors(author.id.toString(), author.name)],
    });
    const schedule = await prismaFakeSchedule.create({
        userId: user.id.toString(),
        scheduleItems: [new ScheduleItem(book.id.toString(), book.name)],
    });

    return schedule;
}
