import { ResourceNotFoundError } from '@usecase/@errors/resource-not-found-error';
import { UpdateAuthorUseCase } from './update-author';
import { AuthorAlreadyExistsError } from '@usecase/@errors/author-already-exists-error';
import { AuthorsMockRepository } from '@mocks/mock-authors-repository';
import { createFakeAuthor } from 'test/factories/fake-author-factory';

let authorsRepository: ReturnType<typeof AuthorsMockRepository>;

describe('[UT] - Update author use case', () => {
    beforeEach(() => {
        authorsRepository = AuthorsMockRepository();
    });

    it('should update author', async () => {
        const author = createFakeAuthor();
        const updatedName = 'Updated Author';
        authorsRepository.findById.mockResolvedValue(author);

        const updateAuthorUseCase = new UpdateAuthorUseCase(authorsRepository);

        const result = await updateAuthorUseCase.execute({
            id: author.id.toString(),
            name: updatedName,
        });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toMatchObject({
            id: author.id.toString(),
            name: updatedName,
            createdAt: author.createdAt,
            updatedAt: expect.any(Date),
        });
    });

    it('should return error when author is not found', async () => {
        const updatedName = 'Updated Author';
        const updateAuthorUseCase = new UpdateAuthorUseCase(authorsRepository);

        const result = await updateAuthorUseCase.execute({
            id: '1',
            name: updatedName,
        });

        expect(result.isLeft()).toBeTruthy();
        expect(result.value).toBeInstanceOf(ResourceNotFoundError);
    });

    it('should return a message error when author already exists', async () => {
        const author = createFakeAuthor();
        const authorWithSameName = createFakeAuthor();

        authorsRepository.findById.mockResolvedValue(author);
        authorsRepository.findByName.mockResolvedValue(authorWithSameName);

        const updateAuthorUseCase = new UpdateAuthorUseCase(authorsRepository);

        const result = await updateAuthorUseCase.execute({
            id: authorWithSameName.id.toString(),
            name: author.name,
        });

        expect(result.isLeft()).toBeTruthy();
        expect(result.value).toBeInstanceOf(AuthorAlreadyExistsError);
    });
});
