import { AppModule } from '@infra/app.module';
import { DatabaseModule } from '@infra/database/prisma/database.module';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { hash } from 'bcryptjs';
import { PrismaFakeAuthor } from 'test/factories/fake-author-factory';
import { PrismaFakeUser } from 'test/factories/fake-user-factory';
import request from 'supertest';
import { PrismaService } from '@infra/database/prisma/prisma.service';

describe('[E2E] - Update author', () => {
    let app: INestApplication;
    let jwt: JwtService;
    let prisma: PrismaService;
    let prismaFakeAuthor: PrismaFakeAuthor;
    let prismaFakeUser: PrismaFakeUser;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule, DatabaseModule],
            providers: [PrismaFakeAuthor, PrismaFakeUser],
        }).compile();

        app = moduleRef.createNestApplication();

        jwt = moduleRef.get(JwtService);
        prismaFakeAuthor = moduleRef.get(PrismaFakeAuthor);
        prismaFakeUser = moduleRef.get(PrismaFakeUser);
        prisma = moduleRef.get(PrismaService);

        await app.init();
    });

    test('[PUT] /authors/:id', async () => {
        const user = await prismaFakeUser.create({
            password: await hash('123456', 8),
        });

        const accessToken = jwt.sign({
            sub: user.id.toString(),
            role: user.role.toString(),
        });

        const updatedName = 'Updated Name';
        const author = await prismaFakeAuthor.create();

        const response = await request(app.getHttpServer())
            .put(`/authors/${author.id.toString()}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                name: updatedName,
            });

        expect(response.statusCode).toBe(204);
        const authorOnDatabase = await prisma.author.findUnique({
            where: {
                id: author.id.toString(),
            },
        });

        expect(authorOnDatabase?.name).toBe(updatedName);
    });
});
