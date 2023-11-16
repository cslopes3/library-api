import { PrismaService } from '@infra/database/prisma/prisma.service';
import { PrismaAuthorsRepository } from '@infra/database/prisma/repositories/prisma-authors-repository';
import { PrismaBookAuthorsRepository } from '@infra/database/prisma/repositories/prisma-book-authors-repository';
import { PrismaBooksRepository } from '@infra/database/prisma/repositories/prisma-books-repository';
import { PrismaPublishersRepository } from '@infra/database/prisma/repositories/prisma-publishers-repository';
import { CreateBookUseCase } from '@usecase/create-book/create-book';
import {
    startEnvironment,
    stopEnvironment,
} from 'test/utils/test-environment-setup';

let prisma: PrismaService;
let booksRepository: PrismaBooksRepository;
let authorsRepository: PrismaAuthorsRepository;
let bookAuthorsRepository: PrismaBookAuthorsRepository;
let publishersRepository: PrismaPublishersRepository;
let createBookUseCase: CreateBookUseCase;

describe('[IT] - Create book', () => {
    beforeEach(() => {
        prisma = new PrismaService();
        startEnvironment();
        booksRepository = new PrismaBooksRepository(prisma);
        authorsRepository = new PrismaAuthorsRepository(prisma);
        bookAuthorsRepository = new PrismaBookAuthorsRepository(prisma);
        publishersRepository = new PrismaPublishersRepository(prisma);
        createBookUseCase = new CreateBookUseCase(
            booksRepository,
            bookAuthorsRepository,
            authorsRepository,
            publishersRepository,
        );
    });

    afterEach(async () => {
        await stopEnvironment(prisma);
    });

    it('should create a book', async () => {
        vi.spyOn(bookAuthorsRepository, 'create');

        await prisma.publisher.create({
            data: {
                id: '1',
                name: 'Publisher 1',
            },
        });

        await prisma.author.create({
            data: {
                id: '1',
                name: 'Author 1',
            },
        });

        const book = {
            name: 'Book 1',
            authors: [
                {
                    id: '1',
                    name: 'Author 1',
                },
            ],
            publisher: {
                id: '1',
                name: 'Publisher 1',
            },
            editionNumber: 1,
            editionDescription: 'Description',
            editionYear: 2023,
            quantity: 10,
            pages: 100,
        };

        const result = await createBookUseCase.execute(book);

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toMatchObject({
            id: expect.any(String),
            name: book.name,
            authors: [
                {
                    id: book.authors[0].id,
                    name: book.authors[0].name,
                },
            ],
            publisher: {
                id: book.publisher.id,
                name: book.publisher.name,
            },
            editionNumber: book.editionNumber,
            editionDescription: book.editionDescription,
            editionYear: book.editionYear,
            quantity: book.quantity,
            available: book.quantity,
            pages: book.pages,
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
        });
        expect(bookAuthorsRepository.create).toHaveBeenCalledOnce();
    });
});
