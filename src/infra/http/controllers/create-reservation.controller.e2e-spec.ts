import { BookAuthors } from '@domain/value-objects/book-authors';
import { BookPublisher } from '@domain/value-objects/book-publisher';
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
import { PrismaFakeUser } from 'test/factories/fake-user-factory';

describe('[E2E] - Create reservation', () => {
    let app: INestApplication;
    let jwt: JwtService;
    let prisma: PrismaService;
    let prismaFakeUser: PrismaFakeUser;
    let prismaFakeAuthor: PrismaFakeAuthor;
    let prismaFakeBook: PrismaFakeBook;
    let prismaFakePublisher: PrismaFakePublisher;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule, DatabaseModule],
            providers: [
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
        prisma = moduleRef.get(PrismaService);

        await app.init();
    });

    test('[POST] /reservations/:id', async () => {
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

        const response = await request(app.getHttpServer())
            .post('/reservations')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                userId: user.id.toString(),
                reservationItems: [
                    {
                        bookId: book.id.toString(),
                        name: book.name,
                    },
                ],
            });

        expect(response.statusCode).toBe(201);

        const reservationOnDatabase = await prisma.reservation.findFirst({
            where: {
                userId: user.id.toString(),
            },
        });

        expect(reservationOnDatabase).toBeTruthy();
    });
});
