import { createFakeAuthor } from 'test/factories/fake-author-factory';
import { FindManyAuthorsUseCase } from './find-many-authors';
import { AuthorsMockRepository } from '@mocks/mock-authors-repository';

let authorsRepository: ReturnType<typeof AuthorsMockRepository>;

describe('[UT] - Find many authors use case', () => {
    beforeEach(() => {
        authorsRepository = AuthorsMockRepository();
    });

    it('should find many authors', async () => {
        const authors = [
            createFakeAuthor(),
            createFakeAuthor({ name: 'Author 2' }),
            createFakeAuthor({ name: 'Author 3' }),
        ];

        authorsRepository.findMany.mockResolvedValue(authors);

        const findManyAuthorsUseCase = new FindManyAuthorsUseCase(
            authorsRepository,
        );

        const result = await findManyAuthorsUseCase.execute({
            params: {
                page: 1,
            },
        });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toHaveLength(3);
        expect(result.value).toEqual([
            expect.objectContaining({
                name: authors[0].name,
            }),
            expect.objectContaining({
                name: authors[1].name,
            }),
            expect.objectContaining({
                name: authors[2].name,
            }),
        ]);
    });

    it('should return an empty array when not found an author', async () => {
        authorsRepository.findMany.mockResolvedValue([]);

        const findManyAuthorsUseCase = new FindManyAuthorsUseCase(
            authorsRepository,
        );

        const result = await findManyAuthorsUseCase.execute({
            params: {
                page: 2,
            },
        });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toHaveLength(0);
    });
});
