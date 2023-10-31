import { Author } from '@domain/entities/author';
import { CreateAuthorUseCase } from './create-author';
import { AuthorAlreadyExistsError } from '@usecase/@errors/author-already-exists-error';

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

let createAuthorUseCase: CreateAuthorUseCase;

describe('[UT] - Create author use case', () => {
    it('should create an author', async () => {
        const authorsRepository = MockRepository();
        createAuthorUseCase = new CreateAuthorUseCase(authorsRepository);

        const result = await createAuthorUseCase.execute({
            name: 'Name 1',
        });

        expect(result.isRight()).toBe(true);
        expect(result.value).toEqual({
            id: expect.any(String),
            name: 'Name 1',
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
        });
    });

    it('should return a message error when author already exists', async () => {
        const author = new Author({
            name: 'Name 1',
        });

        const authorsRepository = MockRepository();
        authorsRepository.findByName.mockReturnValue(Promise.resolve(author));

        createAuthorUseCase = new CreateAuthorUseCase(authorsRepository);

        const result = await createAuthorUseCase.execute({
            name: 'Name 1',
        });

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(AuthorAlreadyExistsError);
    });
});
