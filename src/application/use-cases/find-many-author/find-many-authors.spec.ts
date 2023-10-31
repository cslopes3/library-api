import { Author } from '@domain/entities/author';
import { FindManyAuthorsUseCase } from './find-many-authors';

const author: Author[] = [];

author.push(new Author({ name: 'Name 1' }, '1', new Date(2023, 0, 1)));
author.push(new Author({ name: 'Name 2' }, '2', new Date(2023, 0, 10)));
author.push(new Author({ name: 'Name 3' }, '3', new Date(2023, 0, 20)));

const MockRepository = () => {
    return {
        findById: vi.fn(),
        findByName: vi.fn(),
        findMany: vi.fn().mockReturnValue(Promise.resolve(author)),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        validateManyIds: vi.fn(),
    };
};

describe('[UT] - Find many authors use case', () => {
    it('should find many authors', async () => {
        const authorsRepository = MockRepository();
        const findManyAuthorsUseCase = new FindManyAuthorsUseCase(
            authorsRepository,
        );

        const result = await findManyAuthorsUseCase.execute({
            params: {
                page: 1,
            },
        });

        expect(result.isRight()).toBe(true);
        expect(result.value).toHaveLength(3);
        expect(result.value).toEqual([
            expect.objectContaining({
                name: 'Name 1',
                createdAt: new Date(2023, 0, 1),
            }),
            expect.objectContaining({
                name: 'Name 2',
                createdAt: new Date(2023, 0, 10),
            }),
            expect.objectContaining({
                name: 'Name 3',
                createdAt: new Date(2023, 0, 20),
            }),
        ]);
    });

    it('should return an empty array when not found an author', async () => {
        const authorsRepository = MockRepository();
        authorsRepository.findMany.mockReturnValue(Promise.resolve([]));

        const findManyAuthorsUseCase = new FindManyAuthorsUseCase(
            authorsRepository,
        );

        const result = await findManyAuthorsUseCase.execute({
            params: {
                page: 2,
            },
        });

        expect(result.isRight()).toBe(true);
        expect(result.value).toHaveLength(0);
    });
});
