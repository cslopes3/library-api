import { BookPublisher } from '@domain/value-objects/book-publisher';
import { PrismaService } from '@infra/database/prisma/prisma.service';
import { PrismaBookAuthorsRepository } from '@infra/database/prisma/repositories/prisma-book-authors-repository';
import { PrismaBooksRepository } from '@infra/database/prisma/repositories/prisma-books-repository';
import { DeleteBookUseCase } from '@usecase/delete-book/delete-book';
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
let deleteBookUseCase: DeleteBookUseCase;
let prismaFakePublisher: PrismaFakePublisher;
let prismaFakeAuthor: PrismaFakeAuthor;
let prismaFakeBook: PrismaFakeBook;

describe('[IT] - Delete book', () => {
    beforeEach(() => {
        prisma = new PrismaService();
        startEnvironment();
        booksRepository = new PrismaBooksRepository(prisma);
        bookAuthorsRepository = new PrismaBookAuthorsRepository(prisma);
        deleteBookUseCase = new DeleteBookUseCase(
            booksRepository,
            bookAuthorsRepository,
        );

        prismaFakePublisher = new PrismaFakePublisher(prisma);
        prismaFakeAuthor = new PrismaFakeAuthor(prisma);
        prismaFakeBook = new PrismaFakeBook(prisma);
    });

    afterEach(async () => {
        await stopEnvironment(prisma);
    });

    it('should delete book', async () => {
        const publisher = await prismaFakePublisher.create();
        const author = await prismaFakeAuthor.create();
        const book = await prismaFakeBook.create({
            publisher: new BookPublisher(
                publisher.id.toString(),
                publisher.name,
            ),
        });

        await prisma.bookAuthors.create({
            data: {
                bookId: book.id.toString(),
                authorId: author.id.toString(),
            },
        });

        vi.spyOn(bookAuthorsRepository, 'delete');

        const result = await deleteBookUseCase.execute({
            id: book.id.toString(),
        });

        expect(result.isRight()).toBeTruthy();
        expect(bookAuthorsRepository.delete).toHaveBeenCalledWith(
            book.id.toString(),
        );
    });
});
