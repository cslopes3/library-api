import { PrismaService } from '@infra/database/prisma/prisma.service';
import { PrismaBooksRepository } from '@infra/database/prisma/repositories/prisma-books-repository';
import { RemoveBookFromStockUseCase } from '@usecase/remove-book-from-stock/remove-book-from-stock';
import {
    startEnvironment,
    stopEnvironment,
} from 'test/utils/test-environment-setup';

let prisma: PrismaService;
let booksRepository: PrismaBooksRepository;
let removeBookFromStockUseCase: RemoveBookFromStockUseCase;

describe('[IT] - Remove book from stock', () => {
    beforeEach(() => {
        prisma = new PrismaService();
        startEnvironment();
        booksRepository = new PrismaBooksRepository(prisma);
        removeBookFromStockUseCase = new RemoveBookFromStockUseCase(
            booksRepository,
        );
    });

    afterEach(async () => {
        await stopEnvironment(prisma);
    });

    it('should remove book from stock', async () => {
        const bookQuantity = 10;
        const bookAvailable = 8;

        await prisma.publisher.create({
            data: {
                id: '1',
                name: 'Publisher 1',
            },
        });

        await prisma.book.create({
            data: {
                id: '1',
                name: 'Book 1',
                editionNumber: 1,
                editionDescription: 'Description',
                editionYear: 2023,
                quantity: bookQuantity,
                available: bookAvailable,
                pages: 100,
                publisherId: '1',
            },
        });

        const amount = 5;
        const expectedQuantity = bookQuantity - amount;
        const expectedAvailable = bookAvailable - amount;

        const result = await removeBookFromStockUseCase.execute({
            id: '1',
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
});
