import { PrismaService } from '@infra/database/prisma/prisma.service';
import { PrismaAuthorsRepository } from '@infra/database/prisma/repositories/prisma-authors-repository';
import { DeleteAuthorUseCase } from '@usecase/delete-author/delete-author';
import {
    startEnvironment,
    stopEnvironment,
} from 'test/utils/test-environment-setup';

let prisma: PrismaService;
let authorsRepository: PrismaAuthorsRepository;
let deleteAuthorUseCase: DeleteAuthorUseCase;

describe('[IT] - Delete author ', () => {
    beforeEach(() => {
        prisma = new PrismaService();
        startEnvironment();
        authorsRepository = new PrismaAuthorsRepository(prisma);
        deleteAuthorUseCase = new DeleteAuthorUseCase(authorsRepository);
    });

    afterEach(async () => {
        await stopEnvironment(prisma);
    });

    it('should delete author', async () => {
        const author = {
            id: '1',
            name: 'Author 1',
        };

        await prisma.author.create({
            data: author,
        });

        const result = await deleteAuthorUseCase.execute({
            id: author.id,
        });

        expect(result.isRight()).toBeTruthy();
    });
});
