import { BookPublisher } from '@domain/value-objects/book-publisher';
import { AppModule } from '@infra/app.module';
import { DatabaseModule } from '@infra/database/prisma/database.module';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { PrismaFakeBook } from 'test/factories/fake-book-factory';
import { PrismaFakePublisher } from 'test/factories/fake-publisher-factory';

describe('[E2E] - Find book by id', () => {
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

    test('[GET] /books/:id', async () => {
        const publisher = await prismaFakePublisher.create();
        const book = await prismaFakeBook.create({
            publisher: new BookPublisher(
                publisher.id.toString(),
                publisher.name,
            ),
        });

        const response = await request(app.getHttpServer())
            .get(`/books/${book.id.toString()}`)
            .send();

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            book: expect.objectContaining({ name: book.name }),
        });
    });
});
