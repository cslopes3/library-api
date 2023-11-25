import { AppModule } from '@infra/app.module';
import { DatabaseModule } from '@infra/database/prisma/database.module';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { hash } from 'bcryptjs';
import { PrismaFakeUser } from 'test/factories/fake-user-factory';
import request from 'supertest';
import { PrismaService } from '@infra/database/prisma/prisma.service';
import { PrismaFakePublisher } from 'test/factories/fake-publisher-factory';
import { PrismaFakeBook } from 'test/factories/fake-book-factory';
import { BookPublisher } from '@domain/value-objects/book-publisher';
import { PrismaFakeAuthor } from 'test/factories/fake-author-factory';
import { BookAuthors } from '@domain/value-objects/book-authors';

describe('[E2E] - Update books', () => {
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

    test('[PUT] /books/:id', async () => {
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

        const updatedName = 'Updated Name';

        const response = await request(app.getHttpServer())
            .put(`/books/${book.id.toString()}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                name: updatedName,
                authors: [
                    {
                        id: author.id.toString(),
                        name: author.name,
                    },
                ],
                publisher: {
                    id: publisher.id.toString(),
                    name: publisher.name,
                },
                editionDescription: book.edition.description,
                editionNumber: book.edition.number,
                editionYear: book.edition.year,
                quantity: book.quantity,
                pages: book.pages,
            });

        expect(response.statusCode).toBe(204);
        const bookOnDatabase = await prisma.book.findUnique({
            where: {
                id: book.id.toString(),
            },
        });

        expect(bookOnDatabase?.name).toBe(updatedName);
    });
});
