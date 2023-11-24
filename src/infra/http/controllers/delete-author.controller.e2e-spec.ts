import { AppModule } from '@infra/app.module';
import { DatabaseModule } from '@infra/database/prisma/database.module';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { Test } from '@nestjs/testing';
import { hash } from 'bcryptjs';
import { PrismaFakeAuthor } from 'test/factories/fake-author-factory';
import { PrismaFakeUser } from 'test/factories/fake-user-factory';
import { PrismaService } from '@infra/database/prisma/prisma.service';

describe('[E2E] - Delete author', () => {
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
        prisma = moduleRef.get(PrismaService);
        prismaFakeUser = moduleRef.get(PrismaFakeUser);
        prismaFakeAuthor = moduleRef.get(PrismaFakeAuthor);

        await app.init();
    });

    test('[DELETE] /authors/:id', async () => {
        const user = await prismaFakeUser.create({
            password: await hash('123456', 8),
        });

        const author = await prismaFakeAuthor.create();

        const accessToken = jwt.sign({ sub: user.id.toString() });

        const response = await request(app.getHttpServer())
            .delete(`/authors/${author.id.toString()}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send();

        expect(response.statusCode).toBe(204);
        const authorOnDatabase = await prisma.author.findUnique({
            where: {
                id: author.id.toString(),
            },
        });

        expect(authorOnDatabase).toBeNull();
    });
});
