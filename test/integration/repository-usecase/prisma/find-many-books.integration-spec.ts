import { PrismaService } from '@infra/database/prisma/prisma.service';
import { PrismaBooksRepository } from '@infra/database/prisma/repositories/prisma-books-repository';
import { FindManyBooksUseCase } from '@usecase/find-many-book/find-many-books';
import {
    startEnvironment,
    stopEnvironment,
} from 'test/utils/test-environment-setup';

let prisma: PrismaService;
let booksRepository: PrismaBooksRepository;
let findManyBooksUseCase: FindManyBooksUseCase;

describe('[IT] - Find many books', () => {
    beforeEach(() => {
        prisma = new PrismaService();
        startEnvironment();
        booksRepository = new PrismaBooksRepository(prisma);
        findManyBooksUseCase = new FindManyBooksUseCase(booksRepository);
    });

    afterEach(async () => {
        await stopEnvironment(prisma);
    });

    it('should find many books', async () => {
        await prisma.publisher.create({
            data: {
                id: '1',
                name: 'Publisher 1',
            },
        });

        await prisma.book.createMany({
            data: [
                {
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
                {
                    id: '2',
                    name: 'Book 2',
                    editionNumber: 1,
                    editionDescription: 'Description',
                    editionYear: 2023,
                    quantity: 10,
                    available: 9,
                    pages: 100,
                    publisherId: '1',
                },
            ],
        });

        const result = await findManyBooksUseCase.execute({
            params: {
                page: 1,
            },
        });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toHaveLength(2);
    });

    it('should return an empty array when not found a book', async () => {
        const result = await findManyBooksUseCase.execute({
            params: { page: 1 },
        });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toHaveLength(0);
    });
});
