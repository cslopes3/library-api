import { AppModule } from '@infra/app.module';
import { DatabaseModule } from '@infra/database/prisma/database.module';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { PrismaFakeAuthor } from 'test/factories/fake-author-factory';

describe('[E2E] - Find author by id', () => {
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

    test('[GET] /authors/:id', async () => {
        const author = await prismaFakeAuthor.create();

        const response = await request(app.getHttpServer())
            .get(`/authors/${author.id.toString()}`)
            .send();

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            author: expect.objectContaining({ name: author.name }),
        });
    });
});
