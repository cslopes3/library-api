import { PrismaService } from '@infra/database/prisma/prisma.service';
import { PrismaAuthorsRepository } from '@infra/database/prisma/repositories/prisma-authors-repository';
import { AuthorAlreadyExistsError } from '@usecase/@errors/author-already-exists-error';
import { CreateAuthorUseCase } from '@usecase/create-author/create-author';
import {
    startEnvironment,
    stopEnvironment,
} from 'test/utils/test-environment-setup';

let prisma: PrismaService;
let authorsRepository: PrismaAuthorsRepository;
let createAuthorUseCase: CreateAuthorUseCase;

describe('[IT] - Create author ', () => {
    beforeEach(async () => {
        prisma = new PrismaService();
        startEnvironment();
        authorsRepository = new PrismaAuthorsRepository(prisma);
    });

    afterEach(async () => {
        await stopEnvironment(prisma);
    });

    it('should create a author', async () => {
        createAuthorUseCase = new CreateAuthorUseCase(authorsRepository);

        const result = await createAuthorUseCase.execute({ name: 'Name 1' });

        expect(result.isRight()).toBe(true);
        expect(result.value).toEqual({
            id: expect.any(String),
            name: 'Name 1',
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
        });
    });

    it('should return a message error when author already exists', async () => {
        const author = {
            id: '1',
            name: 'Author 1',
        };

        await prisma.author.create({
            data: author,
        });

        createAuthorUseCase = new CreateAuthorUseCase(authorsRepository);

        const result = await createAuthorUseCase.execute({
            name: 'Author 1',
        });

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(AuthorAlreadyExistsError);
    });
});
