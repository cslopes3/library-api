import { ResourceNotFoundError } from '@usecase/@errors/resource-not-found-error';
import { DeleteAuthorUseCase } from './delete-author';
import { AuthorsMockRepository } from '@mocks/mock-authors-repository';
import { FakeAuthorFactory } from 'test/factories/fake-author-factory';

let authorsRepository: ReturnType<typeof AuthorsMockRepository>;

describe('[UT] - Delete author use case', () => {
    beforeEach(() => {
        authorsRepository = AuthorsMockRepository();
    });

    it('should delete author', async () => {
        const author = FakeAuthorFactory.create();
        authorsRepository.findById.mockResolvedValue(author);
        const deleteAuthorUseCase = new DeleteAuthorUseCase(authorsRepository);

        const result = await deleteAuthorUseCase.execute({
            id: author.id.toString(),
        });

        expect(result.isRight()).toBeTruthy();
    });

    it('should return error when author is not found', async () => {
        const author = FakeAuthorFactory.create();
        const deleteAuthorUseCase = new DeleteAuthorUseCase(authorsRepository);

        const result = await deleteAuthorUseCase.execute({
            id: author.id.toString(),
        });

        expect(result.isLeft()).toBeTruthy();
        expect(result.value).toBeInstanceOf(ResourceNotFoundError);
    });
});
