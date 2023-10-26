import { Author } from '@domain/entities/author';
import { PrismaService } from '@infra/database/prisma/prisma.service';
import { PrismaAuthorsRepository } from '@infra/database/prisma/repositories/prisma-authors-repository';
import { FindManyAuthorsUseCase } from '@usecase/find-many-author.ts/find-many-authors';
import {
    startEnvironment,
    stopEnvironment,
} from 'test/utils/test-environment-setup';

const author: Author[] = [];

author.push(new Author({ name: 'Name 1' }, '1', new Date(2023, 0, 1)));
author.push(new Author({ name: 'Name 2' }, '2', new Date(2023, 0, 10)));
author.push(new Author({ name: 'Name 3' }, '3', new Date(2023, 0, 20)));

let prisma: PrismaService;

describe('[IT] - Find many authors', () => {
    beforeEach(async () => {
        prisma = new PrismaService();
        startEnvironment();
    });

    afterEach(async () => {
        await stopEnvironment(prisma);
    });

    it('should find many authors', async () => {
        const authorsRepository = new PrismaAuthorsRepository(prisma);
        const findManyAuthorsUseCase = new FindManyAuthorsUseCase(
            authorsRepository,
        );

        const author1 = new Author({ name: 'Name 1' });
        await authorsRepository.create(author1);

        const author2 = new Author({ name: 'Name 2' });
        await authorsRepository.create(author2);

        const author3 = new Author({ name: 'Name 3' });
        await authorsRepository.create(author3);

        const result = await findManyAuthorsUseCase.execute({
            params: {
                page: 1,
            },
        });

        expect(result.isRight()).toBe(true);
        expect(result.value).toHaveLength(3);
        expect(result.value![0].name).toEqual(author1.name);
        expect(result.value![1].name).toEqual(author2.name);
        expect(result.value![2].name).toEqual(author3.name);
    });
});
