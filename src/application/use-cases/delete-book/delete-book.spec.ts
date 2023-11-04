import { Book } from '@domain/entities/book';
import { BookAuthors } from '@domain/value-objects/book-authors';
import { BookEdition } from '@domain/value-objects/book-edition';
import { ResourceNotFoundError } from '@usecase/@errors/resource-not-found-error';
import { DeleteBookUseCase } from './delete-book';
import { BookPublisher } from '@domain/value-objects/book-publisher';

const book = new Book({
    name: 'Book 1',
    authors: [
        new BookAuthors('1', 'Author 1'),
        new BookAuthors('2', 'Author 2'),
    ],
    publisher: new BookPublisher('1', 'Publisher 1'),
    edition: new BookEdition(3, 'Book 1 description', 2023),
    quantity: 3,
    available: 3,
    pages: 200,
});

const BookMockRepository = () => {
    return {
        findById: vi.fn().mockReturnValue(Promise.resolve(book)),
        findByName: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        addBookToStock: vi.fn(),
        removeBookFromStock: vi.fn(),
    };
};

describe('[UT] - Delete book use case', () => {
    it('should delete book', async () => {
        const booksRepository = BookMockRepository();
        const deleteBookUseCase = new DeleteBookUseCase(booksRepository);

        const result = await deleteBookUseCase.execute({
            id: book.id.toString(),
        });

        expect(result.isRight()).toBe(true);
    });

    it('should return error when author is not found', async () => {
        const booksRepository = BookMockRepository();
        booksRepository.findById.mockReturnValue(Promise.resolve(null));

        const deleteBookUseCase = new DeleteBookUseCase(booksRepository);

        const result = await deleteBookUseCase.execute({
            id: book.id.toString(),
        });

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(ResourceNotFoundError);
    });
});
