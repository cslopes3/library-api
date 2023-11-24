import { INestApplication } from '@nestjs/common';
import { AppModule } from '@infra/app.module';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { hash } from 'bcryptjs';
import { PrismaFakeUser } from 'test/factories/fake-user-factory';
import { DatabaseModule } from '@infra/database/prisma/database.module';

describe('[E2E] - Authenticate', () => {
    let app: INestApplication;
    let prismaFakeUser: PrismaFakeUser;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule, DatabaseModule],
            providers: [PrismaFakeUser],
        }).compile();

        app = moduleRef.createNestApplication();
        prismaFakeUser = moduleRef.get(PrismaFakeUser);

        await app.init();
    });

    test('[POST] /sessions', async () => {
        const password = '123456';
        const user = await prismaFakeUser.create({
            password: await hash(password, 8),
        });

        const response = await request(app.getHttpServer())
            .post('/sessions')
            .send({
                email: user.email,
                password: password,
            });

        expect(response.statusCode).toBe(201);
        expect(response.body).toEqual({
            access_token: expect.any(String),
        });
    });
});
