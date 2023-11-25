import { BookAuthors } from '@domain/value-objects/book-authors';
import { BookPublisher } from '@domain/value-objects/book-publisher';
import { ReservationItem } from '@domain/value-objects/resevation-item';
import { AppModule } from '@infra/app.module';
import { DatabaseModule } from '@infra/database/prisma/database.module';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaFakeAuthor } from 'test/factories/fake-author-factory';
import { PrismaFakeBook } from 'test/factories/fake-book-factory';
import { PrismaFakePublisher } from 'test/factories/fake-publisher-factory';
import { PrismaFakeReservation } from 'test/factories/fake-reservation-factory';
import { PrismaFakeUser } from 'test/factories/fake-user-factory';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { hash } from 'bcryptjs';

describe('[E2E] - Find reservation by id', () => {
    let app: INestApplication;
    let jwt: JwtService;
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

        await app.init();
    });

    test('[GET] /reservations/:id', async () => {
        const user = await prismaFakeUser.create({
            password: await hash('123456', 8),
        });

        const accessToken = jwt.sign({
            sub: user.id.toString(),
            role: user.role.toString(),
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
            .get(`/reservations/${reservation.id.toString()}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send();

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            reservation: expect.objectContaining({
                id: reservation.id.toString(),
                userId: reservation.userId,
            }),
        });
    });
});
