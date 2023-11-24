import { AppModule } from '@infra/app.module';
import { DatabaseModule } from '@infra/database/prisma/database.module';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { hash } from 'bcryptjs';
import { PrismaFakeUser } from 'test/factories/fake-user-factory';
import { PrismaFakeAuthor } from 'test/factories/fake-author-factory';
import { PrismaFakePublisher } from 'test/factories/fake-publisher-factory';
import { PrismaService } from '@infra/database/prisma/prisma.service';

describe('[E2E] - Create book', () => {
    let app: INestApplication;
    let jwt: JwtService;
    let prisma: PrismaService;
    let prismaFakeUser: PrismaFakeUser;
    let prismaFakeAuthor: PrismaFakeAuthor;
    let prismaFakePublisher: PrismaFakePublisher;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule, DatabaseModule],
            providers: [PrismaFakeUser, PrismaFakeAuthor, PrismaFakePublisher],
        }).compile();

        app = moduleRef.createNestApplication();
        jwt = moduleRef.get(JwtService);
        prisma = moduleRef.get(PrismaService);
        prismaFakeUser = moduleRef.get(PrismaFakeUser);
        prismaFakeAuthor = moduleRef.get(PrismaFakeAuthor);
        prismaFakePublisher = moduleRef.get(PrismaFakePublisher);

        await app.init();
    });

    test('[POST] /books', async () => {
        const user = await prismaFakeUser.create({
            password: await hash('123456', 8),
        });

        const accessToken = jwt.sign({ sub: user.id.toString() });

        const publisher = await prismaFakePublisher.create();
        const author = await prismaFakeAuthor.create();

        const response = await request(app.getHttpServer())
            .post('/books')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                name: 'Book',
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
                editionDescription: 'Book description',
                editionNumber: 1,
                editionYear: 2023,
                quantity: 10,
                pages: 180,
            });

        expect(response.statusCode).toBe(201);

        const bookOnDatabase = await prisma.book.findFirst({
            where: {
                name: 'Book',
            },
        });

        expect(bookOnDatabase).toBeTruthy();
    });
});
