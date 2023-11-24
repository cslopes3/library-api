import { BookAuthors } from '@domain/value-objects/book-authors';
import { BookPublisher } from '@domain/value-objects/book-publisher';
import { ScheduleItem } from '@domain/value-objects/schedule-item';
import { AppModule } from '@infra/app.module';
import { DatabaseModule } from '@infra/database/prisma/database.module';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { hash } from 'bcryptjs';
import { PrismaFakeAuthor } from 'test/factories/fake-author-factory';
import { PrismaFakeBook } from 'test/factories/fake-book-factory';
import { PrismaFakePublisher } from 'test/factories/fake-publisher-factory';
import { PrismaFakeSchedule } from 'test/factories/fake-schedule-factory';
import { PrismaFakeUser } from 'test/factories/fake-user-factory';
import { PrismaService } from '@infra/database/prisma/prisma.service';

describe('[E2E] - Confirm or change schedule status', () => {
    let app: INestApplication;
    let jwt: JwtService;
    let prisma: PrismaService;
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
        jwt = moduleRef.get(JwtService);
        prisma = moduleRef.get(PrismaService);

        prismaFakeUser = moduleRef.get(PrismaFakeUser);
        prismaFakeBook = moduleRef.get(PrismaFakeBook);
        prismaFakePublisher = moduleRef.get(PrismaFakePublisher);
        prismaFakeAuthor = moduleRef.get(PrismaFakeAuthor);
        prismaFakeSchedule = moduleRef.get(PrismaFakeSchedule);

        await app.init();
    });

    test('[PATCH] /schedules/status/:id - Finished', async () => {
        const user = await prismaFakeUser.create({
            password: await hash('123456', 8),
        });

        const accessToken = jwt.sign({ sub: user.id.toString() });

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
            .patch(`/schedules/status/${schedule.id.toString()}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                status: 'finished',
            });

        expect(response.statusCode).toBe(204);

        const scheduleOnDatabase = await prisma.schedule.findUnique({
            where: {
                id: schedule.id.toString(),
            },
        });

        expect(scheduleOnDatabase?.status).toBe('finished');

        const reservationOnDatabase = await prisma.reservation.findFirst({
            where: {
                userId: schedule.userId,
            },
        });

        expect(reservationOnDatabase).not.toBeNull();
    });
});
