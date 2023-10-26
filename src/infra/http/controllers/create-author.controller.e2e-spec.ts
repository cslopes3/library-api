import { INestApplication } from '@nestjs/common';
import { AppModule } from '@infra/app.module';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { PrismaService } from '@infra/database/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('[E@E] - Create author', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let jwt: JwtService;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication();

        prisma = moduleRef.get(PrismaService);
        jwt = moduleRef.get(JwtService);

        await app.init();
    });

    test('[POST] /authors', async () => {
        const user = await prisma.user.create({
            data: {
                name: 'John Doe',
                email: 'johndoe@example.com',
                password: '123456',
            },
        });

        const accessToken = jwt.sign({ sub: user.id });

        const response = await request(app.getHttpServer())
            .post('/authors')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                name: 'John Doe',
            });

        expect(response.statusCode).toBe(201);

        const authorOnDatabase = await prisma.author.findFirst({
            where: {
                name: 'John Doe',
            },
        });

        expect(authorOnDatabase).toBeTruthy();
    });
});
