import { AppModule } from '@infra/app.module';
import { DatabaseModule } from '@infra/database/prisma/database.module';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { hash } from 'bcryptjs';
import { PrismaFakePublisher } from 'test/factories/fake-publisher-factory';
import { PrismaFakeUser } from 'test/factories/fake-user-factory';
import request from 'supertest';
import { PrismaService } from '@infra/database/prisma/prisma.service';

describe('[E2E] - Update publisher', () => {
    let app: INestApplication;
    let jwt: JwtService;
    let prisma: PrismaService;
    let prismaFakePublisher: PrismaFakePublisher;
    let prismaFakeUser: PrismaFakeUser;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule, DatabaseModule],
            providers: [PrismaFakePublisher, PrismaFakeUser],
        }).compile();

        app = moduleRef.createNestApplication();

        jwt = moduleRef.get(JwtService);
        prismaFakePublisher = moduleRef.get(PrismaFakePublisher);
        prismaFakeUser = moduleRef.get(PrismaFakeUser);
        prisma = moduleRef.get(PrismaService);

        await app.init();
    });

    test('[PUT] /publishers/:id', async () => {
        const user = await prismaFakeUser.create({
            password: await hash('123456', 8),
        });

        const accessToken = jwt.sign({
            sub: user.id.toString(),
            role: user.role.toString(),
        });

        const updatedName = 'Updated Name';
        const publisher = await prismaFakePublisher.create();

        const response = await request(app.getHttpServer())
            .put(`/publishers/${publisher.id.toString()}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                name: updatedName,
            });

        expect(response.statusCode).toBe(204);
        const publisherOnDatabase = await prisma.publisher.findUnique({
            where: {
                id: publisher.id.toString(),
            },
        });

        expect(publisherOnDatabase?.name).toBe(updatedName);
    });
});
