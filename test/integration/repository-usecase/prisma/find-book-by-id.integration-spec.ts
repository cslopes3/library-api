import { PrismaService } from '@infra/database/prisma/prisma.service';
import { PrismaBooksRepository } from '@infra/database/prisma/repositories/prisma-books-repository';
import { FindBookByIdUseCase } from '@usecase/find-book-by-id/find-book-by-id';
import {
    startEnvironment,
    stopEnvironment,
} from 'test/utils/test-environment-setup';

let prisma: PrismaService;
let booksRepository: PrismaBooksRepository;
let findBookByIdUseCase: FindBookByIdUseCase;

describe('[IT] - Find book by id', () => {
    beforeEach(() => {
        prisma = new PrismaService();
        startEnvironment();
        booksRepository = new PrismaBooksRepository(prisma);
        findBookByIdUseCase = new FindBookByIdUseCase(booksRepository);
    });

    afterEach(async () => {
        await stopEnvironment(prisma);
    });

    it('should find a book', async () => {
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
                quantity: 10,
                available: 9,
                pages: 100,
                publisherId: '1',
            },
        });

        const result = await findBookByIdUseCase.execute({
            id: '1',
        });

        expect(result.isRight()).toBeTruthy();
        expect(result.value?.name).toBe('Book 1');
    });

    it('should return null when a book is not find', async () => {
        const result = await findBookByIdUseCase.execute({ id: '1' });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toBeNull();
    });
});
