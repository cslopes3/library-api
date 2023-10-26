import { INestApplication } from '@nestjs/common';
import { AppModule } from '@infra/app.module';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { PrismaService } from '@infra/database/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('[E@E] - Find many authors', () => {
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

    test('[GET] /authors', async () => {
        const user = await prisma.user.create({
            data: {
                name: 'John Doe',
                email: 'johndoe@example.com',
                password: '123456',
            },
        });

        const accessToken = jwt.sign({ sub: user.id });

        await prisma.author.createMany({
            data: [
                {
                    name: 'Author 01',
                },
                {
                    name: 'Author 02',
                },
            ],
        });

        const response = await request(app.getHttpServer())
            .get('/authors')
            .set('Authorization', `Bearer ${accessToken}`)
            .send();

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            authors: [
                expect.objectContaining({ name: 'Author 01' }),
                expect.objectContaining({ name: 'Author 02' }),
            ],
        });
    });
});
