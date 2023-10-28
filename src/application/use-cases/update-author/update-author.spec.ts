import { Author } from '@domain/entities/author';
import { ResourceNotFoundError } from '@usecase/@errors/resource-not-found-error';
import { UpdateAuthorUseCase } from './update-author';
import { AuthorAlreadyExistsError } from '@usecase/@errors/author-already-exists-error';

const author = new Author(
    {
        name: 'Updated Name',
    },
    '1',
);

const MockRepository = () => {
    return {
        findById: vi.fn().mockReturnValue(Promise.resolve(author)),
        findByName: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn().mockReturnValue(Promise.resolve(author)),
        delete: vi.fn(),
    };
};

describe('[UT] - Update author use case', () => {
    it('should update author', async () => {
        const authorsRepository = MockRepository();
        const updateAuthorUseCase = new UpdateAuthorUseCase(authorsRepository);

        const result = await updateAuthorUseCase.execute({
            id: '1',
            name: 'Updated Name',
        });

        expect(result.isRight()).toBe(true);
        expect(result.value).toEqual({
            id: author.id.toString(),
            name: 'Updated Name',
            createdAt: author.createdAt,
            updatedAt: expect.any(Date),
        });
    });

    it('should return error when author is not found', async () => {
        const authorsRepository = MockRepository();
        authorsRepository.findById.mockReturnValue(Promise.resolve(null));

        const updateAuthorUseCase = new UpdateAuthorUseCase(authorsRepository);

        const result = await updateAuthorUseCase.execute({
            id: '1',
            name: 'Updated Name',
        });

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(ResourceNotFoundError);
    });

    it('should return a message error when author already exists', async () => {
        const author = new Author(
            {
                name: 'Name 1',
            },
            '1',
        );

        const authorsRepository = MockRepository();
        authorsRepository.findByName.mockReturnValue(Promise.resolve(author));

        const updateAuthorUseCase = new UpdateAuthorUseCase(authorsRepository);

        const result = await updateAuthorUseCase.execute({
            id: '2',
            name: 'Name 1',
        });

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(AuthorAlreadyExistsError);
    });
});
