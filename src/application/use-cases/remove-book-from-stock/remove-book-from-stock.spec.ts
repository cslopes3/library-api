import { CantRemoveFromStockError } from '@usecase/@errors/cant-remove-from-stock-error';
import { ResourceNotFoundError } from '@usecase/@errors/resource-not-found-error';
import { RemoveBookFromStockUseCase } from './remove-book-from-stock';
import { FakeBookFactory } from 'test/factories/fake-book-factory';
import { BooksMockRepository } from '@mocks/mock-books-repository';

let booksRepository: ReturnType<typeof BooksMockRepository>;

describe('[UT] - Remove book from stock use case', () => {
    beforeEach(() => {
        booksRepository = BooksMockRepository();
    });

    it('should remove book from stock', async () => {
        const book = FakeBookFactory.create();
        const amount = 5;
        const expectedQuantity = book.quantity - amount;
        const expectedAvailable = book.available - amount;

        booksRepository.findById.mockResolvedValue(book);

        const removeBookFromStockUseCase = new RemoveBookFromStockUseCase(
            booksRepository,
        );

        const result = await removeBookFromStockUseCase.execute({
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
        const removeBookFromStockUseCase = new RemoveBookFromStockUseCase(
            booksRepository,
        );

        const result = await removeBookFromStockUseCase.execute({
            id: '1',
            amount: 5,
        });

        expect(result.isLeft()).toBeTruthy();
        expect(result.value).toBeInstanceOf(ResourceNotFoundError);
    });

    it('should return error when the removed amount is bigger than the available or total amount', async () => {
        const book = FakeBookFactory.create();
        const amount = book.quantity + 5;

        booksRepository.findById.mockResolvedValue(book);

        const removeBookFromStockUseCase = new RemoveBookFromStockUseCase(
            booksRepository,
        );

        const result = await removeBookFromStockUseCase.execute({
            id: book.id.toString(),
            amount,
        });

        expect(result.isLeft()).toBeTruthy();
        expect(result.value).toBeInstanceOf(CantRemoveFromStockError);
    });
});
