import { PrismaService } from '@infra/database/prisma/prisma.service';
import { PrismaBooksRepository } from '@infra/database/prisma/repositories/prisma-books-repository';
import { AddBookToStockUseCase } from '@usecase/add-book-to-stock/add-book-to-stock';
import {
    startEnvironment,
    stopEnvironment,
} from 'test/utils/test-environment-setup';

let prisma: PrismaService;
let booksRepository: PrismaBooksRepository;
let addBookToStockUseCase: AddBookToStockUseCase;

describe('[IT] - Add book to stock', () => {
    beforeEach(() => {
        prisma = new PrismaService();
        startEnvironment();
        booksRepository = new PrismaBooksRepository(prisma);
        addBookToStockUseCase = new AddBookToStockUseCase(booksRepository);
    });

    afterEach(async () => {
        await stopEnvironment(prisma);
    });

    it('should add book to stock', async () => {
        const bookQuantity = 5;
        const bookAvailable = 3;

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
                publisherId: '1',
                editionNumber: 3,
                editionDescription: 'Book 1 description',
                editionYear: 2023,
                quantity: bookQuantity,
                available: bookAvailable,
                pages: 200,
            },
        });

        const amount = 10;
        const expectedQuantity = bookQuantity + amount;
        const expectedAvailable = bookAvailable + amount;

        const result = await addBookToStockUseCase.execute({
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
