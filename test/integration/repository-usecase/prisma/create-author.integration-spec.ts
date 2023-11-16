import { PrismaService } from '@infra/database/prisma/prisma.service';
import { PrismaAuthorsRepository } from '@infra/database/prisma/repositories/prisma-authors-repository';
import { CreateAuthorUseCase } from '@usecase/create-author/create-author';
import {
    startEnvironment,
    stopEnvironment,
} from 'test/utils/test-environment-setup';

let prisma: PrismaService;
let authorsRepository: PrismaAuthorsRepository;
let createAuthorUseCase: CreateAuthorUseCase;

describe('[IT] - Create author ', () => {
    beforeEach(() => {
        prisma = new PrismaService();
        startEnvironment();
        authorsRepository = new PrismaAuthorsRepository(prisma);
        createAuthorUseCase = new CreateAuthorUseCase(authorsRepository);
    });

    afterEach(async () => {
        await stopEnvironment(prisma);
    });

    it('should create a author', async () => {
        const authorName = 'Author 1';
        const result = await createAuthorUseCase.execute({ name: authorName });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toEqual({
            id: expect.any(String),
            name: authorName,
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
        });
    });
});
