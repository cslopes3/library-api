import { BookPublisher } from '@domain/value-objects/book-publisher';
import { AppModule } from '@infra/app.module';
import { DatabaseModule } from '@infra/database/prisma/database.module';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { hash } from 'bcryptjs';
import { PrismaFakeBook } from 'test/factories/fake-book-factory';
import { PrismaFakePublisher } from 'test/factories/fake-publisher-factory';
import { PrismaFakeUser } from 'test/factories/fake-user-factory';
import request from 'supertest';
import { PrismaService } from '@infra/database/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('[E2E] - Add book to stock', () => {
    let app: INestApplication;
    let jwt: JwtService;
    let prisma: PrismaService;
    let prismaFakeUser: PrismaFakeUser;
    let prismaFakePublisher: PrismaFakePublisher;
    let prismaFakeBook: PrismaFakeBook;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule, DatabaseModule],
            providers: [PrismaFakeUser, PrismaFakePublisher, PrismaFakeBook],
        }).compile();

        app = moduleRef.createNestApplication();
        jwt = moduleRef.get(JwtService);
        prisma = moduleRef.get(PrismaService);
        prismaFakeUser = moduleRef.get(PrismaFakeUser);
        prismaFakePublisher = moduleRef.get(PrismaFakePublisher);
        prismaFakeBook = moduleRef.get(PrismaFakeBook);

        await app.init();
    });

    test('[PATCH] /books/add-to-stock/:id', async () => {
        const user = await prismaFakeUser.create({
            password: await hash('123456', 8),
        });

        const accessToken = jwt.sign({ sub: user.id.toString() });

        const publisher = await prismaFakePublisher.create();
        const book = await prismaFakeBook.create({
            publisher: new BookPublisher(
                publisher.id.toString(),
                publisher.name,
            ),
        });

        const amount = 10;

        const response = await request(app.getHttpServer())
            .patch(`/books/add-to-stock/${book.id.toString()}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                amount,
            });

        expect(response.statusCode).toBe(204);

        const bookOnDatabase = await prisma.book.findUnique({
            where: {
                id: book.id.toString(),
            },
        });

        const expectQuantity = book.quantity + amount;
        const expectAvailable = book.available + amount;

        expect(bookOnDatabase?.quantity).toBe(expectQuantity);
        expect(bookOnDatabase?.available).toBe(expectAvailable);
    });
});
