import { PrismaService } from '@infra/database/prisma/prisma.service';
import { PrismaAuthorsRepository } from '@infra/database/prisma/repositories/prisma-authors-repository';
import { FindAuthorByIdUseCase } from '@usecase/find-author-by-id/find-author-by-id';
import {
    startEnvironment,
    stopEnvironment,
} from 'test/utils/test-environment-setup';

let prisma: PrismaService;
let authorsRepository: PrismaAuthorsRepository;
let findAuthorByIdUseCase: FindAuthorByIdUseCase;

describe('[IT] - Find author by id use case', () => {
    beforeEach(async () => {
        prisma = new PrismaService();
        startEnvironment();

        authorsRepository = new PrismaAuthorsRepository(prisma);
        findAuthorByIdUseCase = new FindAuthorByIdUseCase(authorsRepository);
    });

    afterEach(async () => {
        await stopEnvironment(prisma);
        authorsRepository = new PrismaAuthorsRepository(prisma);
    });

    it('should find an author', async () => {
        const author = {
            id: '1',
            name: 'Author 1',
        };

        await prisma.author.create({
            data: author,
        });

        const result = await findAuthorByIdUseCase.execute({ id: '1' });

        expect(result.isRight()).toBe(true);
        expect(result.value?.name).toBe('Author 1');
    });

    it('should return null when a author is not find', async () => {
        const result = await findAuthorByIdUseCase.execute({ id: '1' });

        expect(result.isRight()).toBe(true);
        expect(result.value).toBeNull();
    });
});
