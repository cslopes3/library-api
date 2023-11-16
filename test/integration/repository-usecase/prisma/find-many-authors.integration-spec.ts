import { PrismaService } from '@infra/database/prisma/prisma.service';
import { PrismaAuthorsRepository } from '@infra/database/prisma/repositories/prisma-authors-repository';
import { FindManyAuthorsUseCase } from '@usecase/find-many-authors/find-many-authors';
import {
    startEnvironment,
    stopEnvironment,
} from 'test/utils/test-environment-setup';

let prisma: PrismaService;
let authorsRepository: PrismaAuthorsRepository;
let findManyAuthorsUseCase: FindManyAuthorsUseCase;

describe('[IT] - Find many authors', () => {
    beforeEach(() => {
        prisma = new PrismaService();
        startEnvironment();

        authorsRepository = new PrismaAuthorsRepository(prisma);
        findManyAuthorsUseCase = new FindManyAuthorsUseCase(authorsRepository);
    });

    afterEach(async () => {
        await stopEnvironment(prisma);
    });

    it('should find many authors', async () => {
        const authors = [
            {
                name: 'Author 1',
            },
            {
                name: 'Author 2',
            },
            {
                name: 'Author 3',
            },
        ];

        await prisma.author.createMany({
            data: authors,
        });

        const result = await findManyAuthorsUseCase.execute({
            params: {
                page: 1,
            },
        });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toHaveLength(3);
        expect(result.value![0].name).toEqual(authors[0].name);
        expect(result.value![1].name).toEqual(authors[1].name);
        expect(result.value![2].name).toEqual(authors[2].name);
    });

    it('should return an empty array when not found an author', async () => {
        const result = await findManyAuthorsUseCase.execute({
            params: {
                page: 2,
            },
        });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toHaveLength(0);
    });
});
