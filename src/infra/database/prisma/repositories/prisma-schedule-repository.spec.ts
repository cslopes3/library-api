import {
    startEnvironment,
    stopEnvironment,
} from 'test/utils/test-environment-setup';
import { PrismaService } from '../prisma.service';
import { SchedulesRepository } from '@repository/schedules-repository';
import { PrismaSchedulesRepository } from './prisma-schedule-repository';
import { FakeScheduleFactory } from 'test/factories/fake-schedule-factory';
import { FakeBookFactory } from 'test/factories/fake-book-factory';
import { FakeAuthorFactory } from 'test/factories/fake-author-factory';
import { FakePublisherFactory } from 'test/factories/fake-publisher-factory';
import { BookAuthors } from '@domain/value-objects/book-authors';
import { BookPublisher } from '@domain/value-objects/book-publisher';
import { ScheduleItem } from '@domain/value-objects/schedule-item';
import { FakeUserFactory } from 'test/factories/fake-user-factory';
import { Schedule } from '@domain/entities/schedule';

let prisma: PrismaService;
let schedulesRepository: SchedulesRepository;

describe('[UT] - Schedules repository', () => {
    beforeEach(() => {
        prisma = new PrismaService();
        startEnvironment();
        schedulesRepository = new PrismaSchedulesRepository(prisma);
    });

    afterEach(async () => {
        await stopEnvironment(prisma);
    });

    it('should create a schedule', async () => {
        const schedule = await createScheduleObjectAndSetup();

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
        const schedule = await createScheduleObjectAndSetup();

        await prisma.schedule.create({
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

        const result = await schedulesRepository.findById(
            schedule.id.toString(),
        );

        expect(result?.id).toEqual(schedule.id);
        expect(result?.date).toEqual(schedule.date);
        expect(result?.status).toEqual(schedule.status);
    });

    it('should find schedules by user id and last days', async () => {
        const schedule = await createScheduleObjectAndSetup();

        await prisma.schedule.create({
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

        const result = await schedulesRepository.findByUserIdAndLastDays(
            schedule.userId,
            schedule.date,
        );

        expect(result[0]?.id).toEqual(schedule.id);
        expect(result[0]?.date).toEqual(schedule.date);
        expect(result[0]?.status).toEqual(schedule.status);
    });

    it('should change schedule status', async () => {
        const schedule = await createScheduleObjectAndSetup();

        await prisma.schedule.create({
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

async function createScheduleObjectAndSetup(): Promise<Schedule> {
    const user = FakeUserFactory.create();
    const publisher = FakePublisherFactory.create();
    const author = FakeAuthorFactory.create();
    const book = FakeBookFactory.create({
        authors: [new BookAuthors(author.id.toString(), author.name)],
        publisher: new BookPublisher(publisher.id.toString(), publisher.name),
    });
    const schedule = FakeScheduleFactory.create({
        userId: user.id.toString(),
        scheduleItems: [new ScheduleItem(book.id.toString(), book.name)],
    });

    await prisma.publisher.create({
        data: {
            id: publisher.id.toString(),
            name: publisher.name,
        },
    });

    await prisma.author.create({
        data: {
            id: author.id.toString(),
            name: author.name,
        },
    });

    await prisma.book.create({
        data: {
            id: book.id.toString(),
            name: book.name,
            publisherId: book.publisher.id,
            editionNumber: book.edition.number,
            editionDescription: book.edition.description,
            editionYear: book.edition.year,
            quantity: book.quantity,
            available: book.available,
            pages: book.pages,
        },
    });

    await prisma.user.create({
        data: {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            password: user.password,
        },
    });

    return schedule;
}
