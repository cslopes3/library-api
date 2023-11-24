import { AppModule } from '@infra/app.module';
import { DatabaseModule } from '@infra/database/prisma/database.module';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { PrismaFakePublisher } from 'test/factories/fake-publisher-factory';

describe('[E2E] - Find publisher by id', () => {
    let app: INestApplication;
    let prismaFakePublisher: PrismaFakePublisher;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule, DatabaseModule],
            providers: [PrismaFakePublisher],
        }).compile();

        app = moduleRef.createNestApplication();

        prismaFakePublisher = moduleRef.get(PrismaFakePublisher);

        await app.init();
    });

    test('[GET] /publishers/:id', async () => {
        const publisher = await prismaFakePublisher.create();

        const response = await request(app.getHttpServer())
            .get(`/publishers/${publisher.id.toString()}`)
            .send();

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            publisher: expect.objectContaining({ name: publisher.name }),
        });
    });
});
