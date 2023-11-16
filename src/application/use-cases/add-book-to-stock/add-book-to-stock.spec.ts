import { ResourceNotFoundError } from '@usecase/@errors/resource-not-found-error';
import { AddBookToStockUseCase } from './add-book-to-stock';
import { FakeBookFactory } from 'test/factories/fake-book-factory';
import { BooksMockRepository } from '@mocks/mock-books-repository';

let booksRepository: ReturnType<typeof BooksMockRepository>;

describe('[UT] - Add book to stock use case', () => {
    beforeEach(() => {
        booksRepository = BooksMockRepository();
    });

    it('should add book to stock', async () => {
        const book = FakeBookFactory.create();
        const amount = 10;
        const expectedQuantity = book.quantity + amount;
        const expectedAvailable = book.available + amount;

        booksRepository.findById.mockResolvedValue(book);

        const addBookToStockUseCase = new AddBookToStockUseCase(
            booksRepository,
        );

        const result = await addBookToStockUseCase.execute({
            id: book.id.toString(),
            amount,
        });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toEqual(
            expect.objectContaining({
                quantity: expectedQuantity,
                available: expectedAvailable,
            }),
        );
    });

    it('should return error when book is not found', async () => {
        const addBookToStockUseCase = new AddBookToStockUseCase(
            booksRepository,
        );

        const result = await addBookToStockUseCase.execute({
            id: '1',
            amount: 10,
        });

        expect(result.isLeft()).toBeTruthy();
        expect(result.value).toBeInstanceOf(ResourceNotFoundError);
    });
});
