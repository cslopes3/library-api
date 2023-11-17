import {
    startEnvironment,
    stopEnvironment,
} from 'test/utils/test-environment-setup';
import { PrismaService } from '../prisma.service';
import { PrismaBooksRepository } from './prisma-books-repository';
import { BookAuthors } from '@domain/value-objects/book-authors';
import { BookPublisher } from '@domain/value-objects/book-publisher';
import { BookEdition } from '@domain/value-objects/book-edition';
import {
    PrismaFakeBook,
    createFakeBook,
} from 'test/factories/fake-book-factory';
import { PrismaFakePublisher } from 'test/factories/fake-publisher-factory';
import { PrismaFakeAuthor } from 'test/factories/fake-author-factory';

let prisma: PrismaService;
let booksRepository: PrismaBooksRepository;
let prismaFakePublisher: PrismaFakePublisher;
let prismaFakeAuthor: PrismaFakeAuthor;
let prismaFakeBook: PrismaFakeBook;

describe('[UT] - Books repository', () => {
    beforeEach(() => {
        prisma = new PrismaService();
        startEnvironment();
        booksRepository = new PrismaBooksRepository(prisma);

        prismaFakePublisher = new PrismaFakePublisher(prisma);
        prismaFakeAuthor = new PrismaFakeAuthor(prisma);
        prismaFakeBook = new PrismaFakeBook(prisma);
    });

    afterEach(async () => {
        await stopEnvironment(prisma);
    });

    it('should create a book', async () => {
        const publisher = await prismaFakePublisher.create();
        const author = await prismaFakeAuthor.create();
        const book = createFakeBook({
            publisher: new BookPublisher(
                publisher.id.toString(),
                publisher.name,
            ),
            authors: [new BookAuthors(author.id.toString(), author.name)],
        });

        vi.spyOn(prisma.book, 'create');
        await booksRepository.create(book);

        expect(prisma.book.create).toHaveBeenCalledWith({
            data: {
                id: book.id.toString(),
                name: book.name,
                publisherId: book.publisher.id,
                editionNumber: book.edition.number,
                editionDescription: book.edition.description,
                editionYear: book.edition.year,
                quantity: book.quantity,
                available: book.available,
                pages: book.pages,
            },
        });
    });

    it('should update a book', async () => {
        const publisher = await prismaFakePublisher.create();
        const author = await prismaFakeAuthor.create();
        const book = await prismaFakeBook.create({
            publisher: new BookPublisher(
                publisher.id.toString(),
                publisher.name,
            ),
            authors: [new BookAuthors(author.id.toString(), author.name)],
        });

        book.changeEdition(new BookEdition(3, 'Updated Description', 2023));

        vi.spyOn(prisma.book, 'update');

        await booksRepository.update(book);

        expect(prisma.book.update).toHaveBeenCalledWith({
            where: {
                id: book.id.toString(),
            },
            data: {
                id: book.id.toString(),
                name: book.name,
                publisherId: book.publisher.id,
                editionNumber: book.edition.number,
                editionDescription: book.edition.description,
                editionYear: book.edition.year,
                pages: book.pages,
            },
        });
    });

    it('should delete a book', async () => {
        const publisher = await prismaFakePublisher.create();
        const author = await prismaFakeAuthor.create();
        const book = await prismaFakeBook.create({
            publisher: new BookPublisher(
                publisher.id.toString(),
                publisher.name,
            ),
            authors: [new BookAuthors(author.id.toString(), author.name)],
        });

        vi.spyOn(prisma.book, 'delete');

        await booksRepository.delete(book.id.toString());
        expect(prisma.book.delete).toHaveBeenCalledWith({
            where: {
                id: book.id.toString(),
            },
        });
    });
});
