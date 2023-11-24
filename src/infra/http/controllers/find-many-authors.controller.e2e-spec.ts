import { INestApplication } from '@nestjs/common';
import { AppModule } from '@infra/app.module';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { PrismaFakeAuthor } from 'test/factories/fake-author-factory';
import { DatabaseModule } from '@infra/database/prisma/database.module';

describe('[E2E] - Find many authors', () => {
    let app: INestApplication;
    let prismaFakeAuthor: PrismaFakeAuthor;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule, DatabaseModule],
            providers: [PrismaFakeAuthor],
        }).compile();

        app = moduleRef.createNestApplication();

        prismaFakeAuthor = moduleRef.get(PrismaFakeAuthor);

        await app.init();
    });

    test('[GET] /authors', async () => {
        const author = await prismaFakeAuthor.create();
        const author2 = await prismaFakeAuthor.create({ name: 'Author 2' });

        const response = await request(app.getHttpServer())
            .get('/authors')
            .send();

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            authors: [
                expect.objectContaining({ name: author.name }),
                expect.objectContaining({ name: author2.name }),
            ],
        });
    });
});
