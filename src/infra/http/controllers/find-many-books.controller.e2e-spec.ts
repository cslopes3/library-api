import { INestApplication } from '@nestjs/common';
import { AppModule } from '@infra/app.module';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DatabaseModule } from '@infra/database/prisma/database.module';
import { PrismaFakeBook } from 'test/factories/fake-book-factory';
import { PrismaFakePublisher } from 'test/factories/fake-publisher-factory';
import { BookPublisher } from '@domain/value-objects/book-publisher';

describe('[E2E] - Find many books', () => {
    let app: INestApplication;
    let prismaFakePublisher: PrismaFakePublisher;
    let prismaFakeBook: PrismaFakeBook;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule, DatabaseModule],
            providers: [PrismaFakePublisher, PrismaFakeBook],
        }).compile();

        app = moduleRef.createNestApplication();

        prismaFakePublisher = moduleRef.get(PrismaFakePublisher);
        prismaFakeBook = moduleRef.get(PrismaFakeBook);

        await app.init();
    });

    test('[GET] /books', async () => {
        const publisher = await prismaFakePublisher.create();
        const book = await prismaFakeBook.create({
            publisher: new BookPublisher(
                publisher.id.toString(),
                publisher.name,
            ),
        });
        const book2 = await prismaFakeBook.create({
            name: 'Book 2',
            publisher: new BookPublisher(
                publisher.id.toString(),
                publisher.name,
            ),
        });

        const response = await request(app.getHttpServer())
            .get('/books')
            .send();

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            books: [
                expect.objectContaining({ name: book.name }),
                expect.objectContaining({ name: book2.name }),
            ],
        });
    });
});
