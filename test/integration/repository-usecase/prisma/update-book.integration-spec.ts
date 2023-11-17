import { BookPublisher } from '@domain/value-objects/book-publisher';
import { PrismaService } from '@infra/database/prisma/prisma.service';
import { PrismaAuthorsRepository } from '@infra/database/prisma/repositories/prisma-authors-repository';
import { PrismaBookAuthorsRepository } from '@infra/database/prisma/repositories/prisma-book-authors-repository';
import { PrismaBooksRepository } from '@infra/database/prisma/repositories/prisma-books-repository';
import { PrismaPublishersRepository } from '@infra/database/prisma/repositories/prisma-publishers-repository';
import { UpdateBookUseCase } from '@usecase/update-book/update-book';
import { PrismaFakeAuthor } from 'test/factories/fake-author-factory';
import { PrismaFakeBook } from 'test/factories/fake-book-factory';
import { PrismaFakePublisher } from 'test/factories/fake-publisher-factory';
import {
    startEnvironment,
    stopEnvironment,
} from 'test/utils/test-environment-setup';

let prisma: PrismaService;
let booksRepository: PrismaBooksRepository;
let bookAuthorsRepository: PrismaBookAuthorsRepository;
let authorsRepository: PrismaAuthorsRepository;
let publishersRepository: PrismaPublishersRepository;
let updateBookUseCase: UpdateBookUseCase;
let prismaFakePublisher: PrismaFakePublisher;
let prismaFakeAuthor: PrismaFakeAuthor;
let prismaFakeBook: PrismaFakeBook;

describe('[IT] - Update book', () => {
    beforeEach(() => {
        prisma = new PrismaService();
        startEnvironment();
        booksRepository = new PrismaBooksRepository(prisma);
        bookAuthorsRepository = new PrismaBookAuthorsRepository(prisma);
        authorsRepository = new PrismaAuthorsRepository(prisma);
        publishersRepository = new PrismaPublishersRepository(prisma);
        updateBookUseCase = new UpdateBookUseCase(
            booksRepository,
            bookAuthorsRepository,
            authorsRepository,
            publishersRepository,
        );

        prismaFakePublisher = new PrismaFakePublisher(prisma);
        prismaFakeAuthor = new PrismaFakeAuthor(prisma);
        prismaFakeBook = new PrismaFakeBook(prisma);
    });

    afterEach(async () => {
        await stopEnvironment(prisma);
    });

    it('should update a book', async () => {
        const publisher = await prismaFakePublisher.create();
        const author = await prismaFakeAuthor.create();
        const book = await prismaFakeBook.create({
            publisher: new BookPublisher(
                publisher.id.toString(),
                publisher.name,
            ),
        });

        vi.spyOn(bookAuthorsRepository, 'create');
        vi.spyOn(bookAuthorsRepository, 'delete');

        const result = await updateBookUseCase.execute({
            id: book.id.toString(),
            name: book.name,
            authors: [{ id: author.id.toString(), name: author.name }],
            publisher: { id: book.publisher.id, name: book.publisher.name },
            editionNumber: 2,
            editionDescription: 'Description updated',
            editionYear: 2023,
            pages: 100,
        });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toEqual({
            id: book.id.toString(),
            name: book.name,
            authors: [{ id: author.id.toString(), name: author.name }],
            publisher: { id: book.publisher.id, name: book.publisher.name },
            editionNumber: 2,
            editionDescription: 'Description updated',
            editionYear: 2023,
            quantity: expect.any(Number),
            available: expect.any(Number),
            pages: 100,
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
        });
        expect(bookAuthorsRepository.delete).toHaveBeenCalledWith(
            book.id.toString(),
        );
        expect(bookAuthorsRepository.create).toHaveBeenCalledOnce();
    });
});
