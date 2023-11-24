import { AppModule } from '@infra/app.module';
import { DatabaseModule } from '@infra/database/prisma/database.module';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { Test } from '@nestjs/testing';
import { hash } from 'bcryptjs';
import { PrismaFakePublisher } from 'test/factories/fake-publisher-factory';
import { PrismaFakeUser } from 'test/factories/fake-user-factory';
import { PrismaService } from '@infra/database/prisma/prisma.service';

describe('[E2E] - Delete publisher', () => {
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
        prisma = moduleRef.get(PrismaService);
        prismaFakeUser = moduleRef.get(PrismaFakeUser);
        prismaFakePublisher = moduleRef.get(PrismaFakePublisher);

        await app.init();
    });

    test('[DELETE] /publishers/:id', async () => {
        const user = await prismaFakeUser.create({
            password: await hash('123456', 8),
        });

        const publisher = await prismaFakePublisher.create();

        const accessToken = jwt.sign({ sub: user.id.toString() });

        const response = await request(app.getHttpServer())
            .delete(`/publishers/${publisher.id.toString()}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send();

        expect(response.statusCode).toBe(204);
        const publisherOnDatabase = await prisma.publisher.findUnique({
            where: {
                id: publisher.id.toString(),
            },
        });

        expect(publisherOnDatabase).toBeNull();
    });
});
