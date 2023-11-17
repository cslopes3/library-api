import { CreateAuthorUseCase } from './create-author';
import { AuthorAlreadyExistsError } from '@usecase/@errors/author-already-exists-error';
import { AuthorsMockRepository } from '@mocks/mock-authors-repository';
import { createFakeAuthor } from 'test/factories/fake-author-factory';

let authorsRepository: ReturnType<typeof AuthorsMockRepository>;

describe('[UT] - Create author use case', () => {
    beforeEach(() => {
        authorsRepository = AuthorsMockRepository();
    });

    it('should create an author', async () => {
        const author = createFakeAuthor();
        const createAuthorUseCase = new CreateAuthorUseCase(authorsRepository);
        const result = await createAuthorUseCase.execute({ name: author.name });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toMatchObject({
            id: expect.any(String),
            name: author.name,
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
        });
    });

    it('should return a message error when author already exists', async () => {
        const author = createFakeAuthor();
        authorsRepository.findByName.mockResolvedValue(author);
        const createAuthorUseCase = new CreateAuthorUseCase(authorsRepository);

        const result = await createAuthorUseCase.execute({ name: author.name });

        expect(result.isLeft()).toBeTruthy();
        expect(result.value).toBeInstanceOf(AuthorAlreadyExistsError);
    });
});
