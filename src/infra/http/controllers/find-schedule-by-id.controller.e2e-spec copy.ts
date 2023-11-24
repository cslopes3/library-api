import { BookAuthors } from '@domain/value-objects/book-authors';
import { BookPublisher } from '@domain/value-objects/book-publisher';
import { AppModule } from '@infra/app.module';
import { DatabaseModule } from '@infra/database/prisma/database.module';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaFakeAuthor } from 'test/factories/fake-author-factory';
import { PrismaFakeBook } from 'test/factories/fake-book-factory';
import { PrismaFakePublisher } from 'test/factories/fake-publisher-factory';
import { PrismaFakeUser } from 'test/factories/fake-user-factory';
import request from 'supertest';
import { PrismaFakeSchedule } from 'test/factories/fake-schedule-factory';
import { ScheduleItem } from '@domain/value-objects/schedule-item';

describe('[E2E] - Find reservation schedule by id', () => {
    let app: INestApplication;
    let prismaFakeUser: PrismaFakeUser;
    let prismaFakeAuthor: PrismaFakeAuthor;
    let prismaFakeBook: PrismaFakeBook;
    let prismaFakePublisher: PrismaFakePublisher;
    let prismaFakeSchedule: PrismaFakeSchedule;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule, DatabaseModule],
            providers: [
                PrismaFakeSchedule,
                PrismaFakePublisher,
                PrismaFakeBook,
                PrismaFakeAuthor,
                PrismaFakeUser,
            ],
        }).compile();

        app = moduleRef.createNestApplication();

        prismaFakeUser = moduleRef.get(PrismaFakeUser);
        prismaFakeBook = moduleRef.get(PrismaFakeBook);
        prismaFakePublisher = moduleRef.get(PrismaFakePublisher);
        prismaFakeAuthor = moduleRef.get(PrismaFakeAuthor);
        prismaFakeSchedule = moduleRef.get(PrismaFakeSchedule);

        await app.init();
    });

    test('[GET] /schedules/:id', async () => {
        const user = await prismaFakeUser.create({
            password: '123456',
        });

        const publisher = await prismaFakePublisher.create();
        const author = await prismaFakeAuthor.create();
        const book = await prismaFakeBook.create({
            publisher: new BookPublisher(
                publisher.id.toString(),
                publisher.name,
            ),
            authors: [new BookAuthors(author.id.toString(), author.name)],
        });

        const schedule = await prismaFakeSchedule.create({
            userId: user.id.toString(),
            scheduleItems: [new ScheduleItem(book.id.toString(), book.name)],
        });

        const response = await request(app.getHttpServer())
            .get(`/schedules/${schedule.id.toString()}`)
            .send();

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            schedule: expect.objectContaining({
                id: schedule.id.toString(),
                userId: schedule.userId,
            }),
        });
    });
});
