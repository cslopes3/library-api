import { ResourceNotFoundError } from '@usecase/@errors/resource-not-found-error';
import { DeleteBookUseCase } from './delete-book';
import { createFakeBook } from 'test/factories/fake-book-factory';
import { BooksMockRepository } from '@mocks/mock-books-repository';
import { BookAuthorsMockRepository } from '@mocks/mock-book-authors-repository';

let booksRepository: ReturnType<typeof BooksMockRepository>;
let bookAuthorsRepository: ReturnType<typeof BookAuthorsMockRepository>;

describe('[UT] - Delete book use case', () => {
    beforeEach(() => {
        booksRepository = BooksMockRepository();
        bookAuthorsRepository = BookAuthorsMockRepository();
    });

    it('should delete book', async () => {
        const book = createFakeBook();

        booksRepository.findById.mockResolvedValue(book);

        vi.spyOn(bookAuthorsRepository, 'delete');

        const deleteBookUseCase = new DeleteBookUseCase(
            booksRepository,
            bookAuthorsRepository,
        );

        const result = await deleteBookUseCase.execute({
            id: book.id.toString(),
        });

        expect(result.isRight()).toBeTruthy();
        expect(bookAuthorsRepository.delete).toHaveBeenCalledWith(
            book.id.toString(),
        );
    });

    it('should return error when book is not found', async () => {
        const deleteBookUseCase = new DeleteBookUseCase(
            booksRepository,
            bookAuthorsRepository,
        );

        const result = await deleteBookUseCase.execute({ id: '1' });

        expect(result.isLeft()).toBeTruthy();
        expect(result.value).toBeInstanceOf(ResourceNotFoundError);
    });
});
