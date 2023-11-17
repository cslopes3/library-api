import { PrismaService } from '@infra/database/prisma/prisma.service';
import { PrismaAuthorsRepository } from '@infra/database/prisma/repositories/prisma-authors-repository';
import { DeleteAuthorUseCase } from '@usecase/delete-author/delete-author';
import { PrismaFakeAuthor } from 'test/factories/fake-author-factory';
import {
    startEnvironment,
    stopEnvironment,
} from 'test/utils/test-environment-setup';

let prisma: PrismaService;
let authorsRepository: PrismaAuthorsRepository;
let deleteAuthorUseCase: DeleteAuthorUseCase;
let prismaFakeAuthor: PrismaFakeAuthor;

describe('[IT] - Delete author ', () => {
    beforeEach(() => {
        prisma = new PrismaService();
        startEnvironment();
        authorsRepository = new PrismaAuthorsRepository(prisma);
        deleteAuthorUseCase = new DeleteAuthorUseCase(authorsRepository);
        prismaFakeAuthor = new PrismaFakeAuthor(prisma);
    });

    afterEach(async () => {
        await stopEnvironment(prisma);
    });

    it('should delete author', async () => {
        const author = await prismaFakeAuthor.create();

        const result = await deleteAuthorUseCase.execute({
            id: author.id.toString(),
        });

        expect(result.isRight()).toBeTruthy();
    });
});
