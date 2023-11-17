import { BooksMockRepository } from '@mocks/mock-books-repository';
import { FindBookByIdUseCase } from './find-book-by-id';
import { createFakeBook } from 'test/factories/fake-book-factory';

let booksRepository: ReturnType<typeof BooksMockRepository>;

describe('[UT] - Find book by id use case', () => {
    beforeEach(() => {
        booksRepository = BooksMockRepository();
    });

    it('should find a book', async () => {
        const book = createFakeBook();
        booksRepository.findById.mockResolvedValue(book);

        const findBookByIdUseCase = new FindBookByIdUseCase(booksRepository);

        const result = await findBookByIdUseCase.execute({
            id: book.id.toString(),
        });

        expect(result.isRight()).toBeTruthy();
        expect(result.value?.name).toBe(book.name);
    });

    it('should return null when a book is not find', async () => {
        booksRepository.findById.mockReturnValue(null);

        const findBookByIdUseCase = new FindBookByIdUseCase(booksRepository);

        const result = await findBookByIdUseCase.execute({ id: '1' });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toBeNull();
    });
});
