import { BookPublisher } from '@domain/value-objects/book-publisher';
import { PrismaService } from '@infra/database/prisma/prisma.service';
import { PrismaBooksRepository } from '@infra/database/prisma/repositories/prisma-books-repository';
import { RemoveBookFromStockUseCase } from '@usecase/remove-book-from-stock/remove-book-from-stock';
import { PrismaFakeBook } from 'test/factories/fake-book-factory';
import { PrismaFakePublisher } from 'test/factories/fake-publisher-factory';
import {
    startEnvironment,
    stopEnvironment,
} from 'test/utils/test-environment-setup';

let prisma: PrismaService;
let booksRepository: PrismaBooksRepository;
let removeBookFromStockUseCase: RemoveBookFromStockUseCase;
let prismaFakePublisher: PrismaFakePublisher;
let prismaFakeBook: PrismaFakeBook;

describe('[IT] - Remove book from stock', () => {
    beforeEach(() => {
        prisma = new PrismaService();
        startEnvironment();
        booksRepository = new PrismaBooksRepository(prisma);
        removeBookFromStockUseCase = new RemoveBookFromStockUseCase(
            booksRepository,
        );
        prismaFakePublisher = new PrismaFakePublisher(prisma);
        prismaFakeBook = new PrismaFakeBook(prisma);
    });

    afterEach(async () => {
        await stopEnvironment(prisma);
    });

    it('should remove book from stock', async () => {
        const bookQuantity = 10;
        const bookAvailable = 8;
        const amount = 5;
        const expectedQuantity = bookQuantity - amount;
        const expectedAvailable = bookAvailable - amount;

        const publisher = await prismaFakePublisher.create();
        const book = await prismaFakeBook.create({
            publisher: new BookPublisher(
                publisher.id.toString(),
                publisher.name,
            ),
            quantity: bookQuantity,
            available: bookAvailable,
        });

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
});
