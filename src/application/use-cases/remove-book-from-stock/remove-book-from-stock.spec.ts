import { Book } from '@domain/entities/book';
import { BookAuthors } from '@domain/value-objects/book-authors';
import { BookEdition } from '@domain/value-objects/book-edition';
import { BookPublisher } from '@domain/value-objects/book-publisher';
import { CantRemoveFromStockError } from '@usecase/@errors/cant-remove-from-stock-error';
import { ResourceNotFoundError } from '@usecase/@errors/resource-not-found-error';
import { RemoveBookFromStockUseCase } from './remove-book-from-stock';

const book = new Book(
    {
        name: 'Book 1',
        authors: [new BookAuthors('1', 'Author 1')],
        publisher: new BookPublisher('1', 'Publisher 1'),
        edition: new BookEdition(3, 'Book 1 description', 2023),
        quantity: 10,
        available: 8,
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

describe('[UT] - Remove book from stock use case', () => {
    it('should remove book from stock', async () => {
        const booksRepository = MockRepository();
        const removeBookFromStockUseCase = new RemoveBookFromStockUseCase(
            booksRepository,
        );

        const result = await removeBookFromStockUseCase.execute({
            id: '1',
            amount: 5,
        });

        expect(result.isRight()).toBe(true);
        expect(result.value).toEqual(
            expect.objectContaining({ quantity: 5, available: 3 }),
        );
    });

    it('should return error when book is not found', async () => {
        const booksRepository = MockRepository();
        booksRepository.findById.mockReturnValue(Promise.resolve(null));

        const removeBookFromStockUseCase = new RemoveBookFromStockUseCase(
            booksRepository,
        );

        const result = await removeBookFromStockUseCase.execute({
            id: '1',
            amount: 5,
        });

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(ResourceNotFoundError);
    });

    it('should return error when the removed amount is bigger than the available amount', async () => {
        const booksRepository = MockRepository();

        const removeBookFromStockUseCase = new RemoveBookFromStockUseCase(
            booksRepository,
        );

        const result = await removeBookFromStockUseCase.execute({
            id: '1',
            amount: 9,
        });

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(CantRemoveFromStockError);
    });

    it('should return error when the removed amount is bigger than the total amount', async () => {
        const booksRepository = MockRepository();
        const book = new Book(
            {
                name: 'Book 1',
                authors: [new BookAuthors('1', 'Author 1')],
                publisher: new BookPublisher('1', 'Publisher 1'),
                edition: new BookEdition(3, 'Book 1 description', 2023),
                quantity: 10,
                available: 10,
                pages: 200,
            },
            '1',
        );

        booksRepository.findById.mockReturnValue(Promise.resolve(book));

        const removeBookFromStockUseCase = new RemoveBookFromStockUseCase(
            booksRepository,
        );

        const result = await removeBookFromStockUseCase.execute({
            id: '1',
            amount: 11,
        });

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(CantRemoveFromStockError);
    });
});
