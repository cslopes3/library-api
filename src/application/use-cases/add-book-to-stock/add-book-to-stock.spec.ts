import { Book } from '@domain/entities/book';
import { BookAuthors } from '@domain/value-objects/book-authors';
import { BookEdition } from '@domain/value-objects/book-edition';
import { BookPublisher } from '@domain/value-objects/book-publisher';
import { ResourceNotFoundError } from '@usecase/@errors/resource-not-found-error';
import { AddBookToStockUseCase } from './add-book-to-stock';

const book = new Book(
    {
        name: 'Book 1',
        authors: [
            new BookAuthors('1', 'Author 1'),
            new BookAuthors('2', 'Author 2'),
        ],
        publisher: new BookPublisher('1', 'Publisher 1'),
        edition: new BookEdition(3, 'Book 1 description', 2023),
        quantity: 3,
        available: 1,
        pages: 200,
    },
    '1',
);

const MockRepository = () => {
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

describe('[UT] - Add book to stock use case', () => {
    it('should add book to stock', async () => {
        const booksRepository = MockRepository();

        const addBookToStockUseCase = new AddBookToStockUseCase(
            booksRepository,
        );

        const result = await addBookToStockUseCase.execute({
            id: '1',
            amount: 10,
        });

        expect(result.isRight()).toBe(true);
        expect(result.value).toEqual(
            expect.objectContaining({ quantity: 13, available: 11 }),
        );
    });

    it('should return error when book is not found', async () => {
        const booksRepository = MockRepository();
        booksRepository.findById.mockReturnValue(Promise.resolve(null));

        const addBookToStockUseCase = new AddBookToStockUseCase(
            booksRepository,
        );

        const result = await addBookToStockUseCase.execute({
            id: '1',
            amount: 10,
        });

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(ResourceNotFoundError);
    });
});
