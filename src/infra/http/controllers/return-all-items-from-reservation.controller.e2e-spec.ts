import { BookAuthors } from '@domain/value-objects/book-authors';
import { BookPublisher } from '@domain/value-objects/book-publisher';
import { ReservationItem } from '@domain/value-objects/resevation-item';
import { AppModule } from '@infra/app.module';
import { DatabaseModule } from '@infra/database/prisma/database.module';
import { PrismaService } from '@infra/database/prisma/prisma.service';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { hash } from 'bcryptjs';
import request from 'supertest';
import { PrismaFakeAuthor } from 'test/factories/fake-author-factory';
import { PrismaFakeBook } from 'test/factories/fake-book-factory';
import { PrismaFakePublisher } from 'test/factories/fake-publisher-factory';
import { PrismaFakeReservation } from 'test/factories/fake-reservation-factory';
import { PrismaFakeUser } from 'test/factories/fake-user-factory';

describe('[E2E] - Return all items from reservation', () => {
    let app: INestApplication;
    let jwt: JwtService;
    let prisma: PrismaService;
    let prismaFakeUser: PrismaFakeUser;
    let prismaFakeAuthor: PrismaFakeAuthor;
    let prismaFakeBook: PrismaFakeBook;
    let prismaFakePublisher: PrismaFakePublisher;
    let prismaFakeReservation: PrismaFakeReservation;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule, DatabaseModule],
            providers: [
                PrismaFakeReservation,
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
        prismaFakeReservation = moduleRef.get(PrismaFakeReservation);

        await app.init();
    });

    test('[PATCH] /reservations/return/:id', async () => {
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
        const book2 = await prismaFakeBook.create({
            publisher: new BookPublisher(
                publisher.id.toString(),
                publisher.name,
            ),
            authors: [new BookAuthors(author.id.toString(), author.name)],
        });

        const reservation = await prismaFakeReservation.create({
            userId: user.id.toString(),
            reservationItem: [
                new ReservationItem(
                    book.id.toString(),
                    book.name,
                    new Date(),
                    false,
                    false,
                ),
                new ReservationItem(
                    book2.id.toString(),
                    book2.name,
                    new Date(),
                    false,
                    false,
                ),
            ],
        });

        const response = await request(app.getHttpServer())
            .patch(`/reservations/return/${reservation.id.toString()}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send();

        expect(response.statusCode).toBe(204);

        const itemsId = [
            reservation.reservationItem[0].id.toString(),
            reservation.reservationItem[1].id.toString(),
        ];

        const reservationItemOnDatabase = await prisma.reservationItem.findMany(
            {
                where: {
                    id: { in: itemsId },
                },
            },
        );

        expect(reservationItemOnDatabase[0]?.returned).toBeTruthy();
        expect(reservationItemOnDatabase[1]?.returned).toBeTruthy();
    });
});
