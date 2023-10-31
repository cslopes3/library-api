import { Author } from '@domain/entities/author';
import { FindAuthorByIdUseCase } from './find-author-by-id';

const MockRepository = () => {
    return {
        findById: vi.fn(),
        findByName: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        validateManyIds: vi.fn(),
    };
};

describe('[UT] - Find author by id use case', () => {
    it('should find an author', async () => {
        const authorsRepository = MockRepository();

        const author = new Author(
            {
                name: 'Author 1',
            },
            '1',
        );

        authorsRepository.findById.mockReturnValue(Promise.resolve(author));

        const findAuthorByIdUseCase = new FindAuthorByIdUseCase(
            authorsRepository,
        );

        const result = await findAuthorByIdUseCase.execute({ id: '1' });

        expect(result.isRight()).toBe(true);
        expect(result.value?.name).toBe('Author 1');
    });

    it('should return null when a author is not find', async () => {
        const authorsRepository = MockRepository();
        authorsRepository.findById.mockReturnValue(Promise.resolve(null));

        const findAuthorByIdUseCase = new FindAuthorByIdUseCase(
            authorsRepository,
        );

        const result = await findAuthorByIdUseCase.execute({ id: '1' });

        expect(result.isRight()).toBe(true);
        expect(result.value).toBeNull();
    });
});
