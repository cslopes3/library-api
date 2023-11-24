import { INestApplication } from '@nestjs/common';
import { AppModule } from '@infra/app.module';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { PrismaFakePublisher } from 'test/factories/fake-publisher-factory';
import { DatabaseModule } from '@infra/database/prisma/database.module';

describe('[E2E] - Find many publishers', () => {
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

    test('[GET] /publishers', async () => {
        const publisher = await prismaFakePublisher.create();
        const publisher2 = await prismaFakePublisher.create({
            name: 'publisher 2',
        });

        const response = await request(app.getHttpServer())
            .get('/publishers')
            .send();

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            publishers: [
                expect.objectContaining({ name: publisher.name }),
                expect.objectContaining({ name: publisher2.name }),
            ],
        });
    });
});
