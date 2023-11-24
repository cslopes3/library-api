import { INestApplication } from '@nestjs/common';
import { AppModule } from '@infra/app.module';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { PrismaService } from '@infra/database/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaFakeUser } from 'test/factories/fake-user-factory';
import { hash } from 'bcryptjs';
import { DatabaseModule } from '@infra/database/prisma/database.module';

describe('[E2E] - Create author', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let jwt: JwtService;
    let prismaFakeUser: PrismaFakeUser;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule, DatabaseModule],
            providers: [PrismaFakeUser],
        }).compile();

        app = moduleRef.createNestApplication();

        prisma = moduleRef.get(PrismaService);
        jwt = moduleRef.get(JwtService);
        prismaFakeUser = moduleRef.get(PrismaFakeUser);

        await app.init();
    });

    test('[POST] /authors', async () => {
        const user = await prismaFakeUser.create({
            password: await hash('123456', 8),
        });

        const accessToken = jwt.sign({ sub: user.id.toString() });

        const response = await request(app.getHttpServer())
            .post('/authors')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                name: 'Author',
            });

        expect(response.statusCode).toBe(201);

        const authorOnDatabase = await prisma.author.findFirst({
            where: {
                name: 'Author',
            },
        });

        expect(authorOnDatabase).toBeTruthy();
    });
});
