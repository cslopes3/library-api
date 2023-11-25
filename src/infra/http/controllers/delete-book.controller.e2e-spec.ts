import { AppModule } from '@infra/app.module';
import { DatabaseModule } from '@infra/database/prisma/database.module';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { Test } from '@nestjs/testing';
import { hash } from 'bcryptjs';
import { PrismaFakePublisher } from 'test/factories/fake-publisher-factory';
import { PrismaFakeUser } from 'test/factories/fake-user-factory';
import { PrismaService } from '@infra/database/prisma/prisma.service';
import { PrismaFakeBook } from 'test/factories/fake-book-factory';
import { BookPublisher } from '@domain/value-objects/book-publisher';

describe('[E2E] - Delete book', () => {
    let app: INestApplication;
    let jwt: JwtService;
    let prisma: PrismaService;
    let prismaFakePublisher: PrismaFakePublisher;
    let prismaFakeBook: PrismaFakeBook;
    let prismaFakeUser: PrismaFakeUser;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule, DatabaseModule],
            providers: [PrismaFakePublisher, PrismaFakeUser, PrismaFakeBook],
        }).compile();

        app = moduleRef.createNestApplication();

        jwt = moduleRef.get(JwtService);
        prisma = moduleRef.get(PrismaService);
        prismaFakeUser = moduleRef.get(PrismaFakeUser);
        prismaFakePublisher = moduleRef.get(PrismaFakePublisher);
        prismaFakeBook = moduleRef.get(PrismaFakeBook);

        await app.init();
    });

    test('[DELETE] /books/:id', async () => {
        const user = await prismaFakeUser.create({
            password: await hash('123456', 8),
        });

        const accessToken = jwt.sign({
            sub: user.id.toString(),
            role: user.role.toString(),
        });

        const publisher = await prismaFakePublisher.create();
        const book = await prismaFakeBook.create({
            publisher: new BookPublisher(
                publisher.id.toString(),
                publisher.name,
            ),
        });

        const response = await request(app.getHttpServer())
            .delete(`/books/${book.id.toString()}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send();

        expect(response.statusCode).toBe(204);
        const bookOnDatabase = await prisma.book.findUnique({
            where: {
                id: book.id.toString(),
            },
        });

        const bookAuthorsOnDatabase = await prisma.bookAuthors.findMany({
            where: {
                bookId: book.id.toString(),
            },
        });

        expect(bookOnDatabase).toBeNull();
        expect(bookAuthorsOnDatabase).toHaveLength(0);
    });
});
