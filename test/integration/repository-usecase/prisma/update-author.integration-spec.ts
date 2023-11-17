import { PrismaService } from '@infra/database/prisma/prisma.service';
import { PrismaAuthorsRepository } from '@infra/database/prisma/repositories/prisma-authors-repository';
import { UpdateAuthorUseCase } from '@usecase/update-author/update-author';
import { PrismaFakeAuthor } from 'test/factories/fake-author-factory';
import {
    startEnvironment,
    stopEnvironment,
} from 'test/utils/test-environment-setup';

let prisma: PrismaService;
let authorsRepository: PrismaAuthorsRepository;
let updateAuthorUseCase: UpdateAuthorUseCase;
let prismaFakeAuthor: PrismaFakeAuthor;

describe('[IT] - Update author ', () => {
    beforeEach(() => {
        prisma = new PrismaService();
        startEnvironment();
        authorsRepository = new PrismaAuthorsRepository(prisma);
        updateAuthorUseCase = new UpdateAuthorUseCase(authorsRepository);

        prismaFakeAuthor = new PrismaFakeAuthor(prisma);
    });

    afterEach(async () => {
        await stopEnvironment(prisma);
    });

    it('should update author', async () => {
        const updatedName = 'Updated Author';
        const author = await prismaFakeAuthor.create();

        const result = await updateAuthorUseCase.execute({
            id: author.id.toString(),
            name: updatedName,
        });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toMatchObject({
            id: author.id.toString(),
            name: updatedName,
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
        });
    });
});
