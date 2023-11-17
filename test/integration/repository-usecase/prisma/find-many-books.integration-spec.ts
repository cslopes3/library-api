import { BookPublisher } from '@domain/value-objects/book-publisher';
import { PrismaService } from '@infra/database/prisma/prisma.service';
import { PrismaBooksRepository } from '@infra/database/prisma/repositories/prisma-books-repository';
import { FindManyBooksUseCase } from '@usecase/find-many-book/find-many-books';
import { PrismaFakeBook } from 'test/factories/fake-book-factory';
import { PrismaFakePublisher } from 'test/factories/fake-publisher-factory';
import {
    startEnvironment,
    stopEnvironment,
} from 'test/utils/test-environment-setup';

let prisma: PrismaService;
let booksRepository: PrismaBooksRepository;
let findManyBooksUseCase: FindManyBooksUseCase;
let prismaFakePublisher: PrismaFakePublisher;
let prismaFakeBook: PrismaFakeBook;

describe('[IT] - Find many books', () => {
    beforeEach(() => {
        prisma = new PrismaService();
        startEnvironment();
        booksRepository = new PrismaBooksRepository(prisma);
        findManyBooksUseCase = new FindManyBooksUseCase(booksRepository);
        prismaFakePublisher = new PrismaFakePublisher(prisma);
        prismaFakeBook = new PrismaFakeBook(prisma);
    });

    afterEach(async () => {
        await stopEnvironment(prisma);
    });

    it('should find many books', async () => {
        const publisher = await prismaFakePublisher.create();
        await prismaFakeBook.create({
            publisher: new BookPublisher(
                publisher.id.toString(),
                publisher.name,
            ),
        });
        await prismaFakeBook.create({
            name: 'Book 2',
            publisher: new BookPublisher(
                publisher.id.toString(),
                publisher.name,
            ),
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
