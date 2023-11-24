import { INestApplication } from '@nestjs/common';
import { AppModule } from '@infra/app.module';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { PrismaService } from '@infra/database/prisma/prisma.service';

describe('[E2E] - Create account', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication();

        prisma = moduleRef.get(PrismaService);

        await app.init();
    });

    test('[POST] /accounts', async () => {
        const response = await request(app.getHttpServer())
            .post('/accounts')
            .send({
                name: 'User',
                email: 'user@example.com',
                password: '123456',
            });

        expect(response.statusCode).toBe(201);

        const userOnDatabase = await prisma.user.findUnique({
            where: {
                email: 'user@example.com',
            },
        });

        expect(userOnDatabase).toBeTruthy();
    });
});
