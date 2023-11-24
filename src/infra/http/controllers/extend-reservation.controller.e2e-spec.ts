import { ReservationItem } from '@domain/value-objects/resevation-item';
import { AppModule } from '@infra/app.module';
import { DatabaseModule } from '@infra/database/prisma/database.module';
import { PrismaService } from '@infra/database/prisma/prisma.service';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { PrismaFakeAuthor } from 'test/factories/fake-author-factory';
import { PrismaFakeBook } from 'test/factories/fake-book-factory';
import { PrismaFakePublisher } from 'test/factories/fake-publisher-factory';
import { PrismaFakeReservation } from 'test/factories/fake-reservation-factory';
import { PrismaFakeUser } from 'test/factories/fake-user-factory';
import request from 'supertest';
import { hash } from 'bcryptjs';
import { BookPublisher } from '@domain/value-objects/book-publisher';
import { BookAuthors } from '@domain/value-objects/book-authors';

describe('[E2E] - Extend reservation', () => {
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
        prismaFakeUser = moduleRef.get(PrismaFakeUser);
        prismaFakeBook = moduleRef.get(PrismaFakeBook);
        prismaFakePublisher = moduleRef.get(PrismaFakePublisher);
        prismaFakeAuthor = moduleRef.get(PrismaFakeAuthor);
        prismaFakeReservation = moduleRef.get(PrismaFakeReservation);
        prisma = moduleRef.get(PrismaService);

        await app.init();
    });

    test('[PATCH] /reservations/extend/:id', async () => {
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
            ],
        });

        const response = await request(app.getHttpServer())
            .patch(`/reservations/extend/${reservation.id.toString()}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send();

        expect(response.statusCode).toBe(204);

        const reservationItemsOnDatabase =
            await prisma.reservationItem.findMany({
                where: {
                    reservationId: reservation.id.toString(),
                },
            });

        expect(reservationItemsOnDatabase[0].alreadyExtendTime).toBeTruthy();
        expect(reservationItemsOnDatabase[0].expirationDate).not.toBe(
            reservation.reservationItem[0].expirationDate,
        );
    });
});
