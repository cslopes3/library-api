import { FindAuthorByIdUseCase } from './find-author-by-id';
import { AuthorsMockRepository } from '@mocks/mock-authors-repository';
import { FakeAuthorFactory } from 'test/factories/fake-author-factory';

let authorsRepository: ReturnType<typeof AuthorsMockRepository>;

describe('[UT] - Find author by id use case', () => {
    beforeEach(() => {
        authorsRepository = AuthorsMockRepository();
    });

    it('should find an author', async () => {
        const author = FakeAuthorFactory.create();
        authorsRepository.findById.mockResolvedValue(author);

        const findAuthorByIdUseCase = new FindAuthorByIdUseCase(
            authorsRepository,
        );

        const result = await findAuthorByIdUseCase.execute({
            id: author.id.toString(),
        });

        expect(result.isRight()).toBeTruthy();
        expect(result.value?.name).toBe(author.name);
    });

    it('should return null when a author is not find', async () => {
        const findAuthorByIdUseCase = new FindAuthorByIdUseCase(
            authorsRepository,
        );

        const result = await findAuthorByIdUseCase.execute({ id: '1' });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toBeNull();
    });
});
