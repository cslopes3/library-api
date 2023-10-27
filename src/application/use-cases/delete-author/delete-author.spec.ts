import { Author } from '@domain/entities/author';
import { ResourceNotFoundError } from '@usecase/@errors/resource-not-found-error';
import { DeleteAuthorUseCase } from './delete-author';

const author = new Author(
    {
        name: 'Updated Name',
    },
    '1',
);

const MockRepository = () => {
    return {
        findById: vi.fn().mockReturnValue(Promise.resolve(author)),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    };
};

describe('[UT] - Delete author use case', () => {
    it('should delete author', async () => {
        const authorsRepository = MockRepository();
        const deleteAuthorUseCase = new DeleteAuthorUseCase(authorsRepository);

        const result = await deleteAuthorUseCase.execute({
            id: author.id.toString(),
        });

        expect(result.isRight()).toBe(true);
    });

    it('should return error when author is not found', async () => {
        const authorsRepository = MockRepository();
        authorsRepository.findById.mockReturnValue(Promise.resolve(null));

        const deleteAuthorUseCase = new DeleteAuthorUseCase(authorsRepository);

        const result = await deleteAuthorUseCase.execute({
            id: author.id.toString(),
        });

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(ResourceNotFoundError);
    });
});
