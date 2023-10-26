import { PrismaService } from '@infra/database/prisma/prisma.service';
import { PrismaAuthorsRepository } from '@infra/database/prisma/repositories/prisma-authors-repository';
import { CreateAuthorUseCase } from '@usecase/create-author/create-author';
import {
    startEnvironment,
    stopEnvironment,
} from 'test/utils/test-environment-setup';

let prisma: PrismaService;

describe('[IT] - Create author ', () => {
    beforeEach(async () => {
        prisma = new PrismaService();
        startEnvironment();
    });

    afterEach(async () => {
        await stopEnvironment(prisma);
    });

    it('should create a author', async () => {
        const authorsRepository = new PrismaAuthorsRepository(prisma);
        const createAuthorUseCase = new CreateAuthorUseCase(authorsRepository);

        const result = await createAuthorUseCase.execute({ name: 'Name 1' });

        expect(result.isRight()).toBe(true);
        expect(result.value).toEqual({
            id: expect.any(String),
            name: 'Name 1',
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
        });
    });
});
