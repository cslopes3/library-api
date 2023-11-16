import {
    startEnvironment,
    stopEnvironment,
} from 'test/utils/test-environment-setup';
import { PrismaService } from '../prisma.service';
import { PrismaBooksRepository } from './prisma-books-repository';
import { BookAuthors } from '@domain/value-objects/book-authors';
import { BookPublisher } from '@domain/value-objects/book-publisher';
import { BookEdition } from '@domain/value-objects/book-edition';
import { FakeBookFactory } from 'test/factories/fake-book-factory';

let prisma: PrismaService;
let booksRepository: PrismaBooksRepository;

describe('[UT] - Books repository', () => {
    beforeEach(() => {
        prisma = new PrismaService();
        startEnvironment();
        booksRepository = new PrismaBooksRepository(prisma);
    });

    afterEach(async () => {
        await stopEnvironment(prisma);
    });

    it('should create a author', async () => {
        vi.spyOn(prisma.book, 'create');

        const book = FakeBookFactory.create();

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
        vi.spyOn(prisma.book, 'update');

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

        await prisma.book.create({
            data: {
                id: '1',
                name: 'Book 1',
                publisherId: '1',
                editionNumber: 3,
                editionDescription: 'Book 1 description',
                editionYear: 2020,
                quantity: 3,
                available: 1,
                pages: 10,
            },
        });

        const book = FakeBookFactory.create({
            authors: [new BookAuthors('1', 'Author 1')],
            publisher: new BookPublisher('1', 'Publisher 1'),
            edition: new BookEdition(3, 'Book 1 description', 2023),
        });

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
        vi.spyOn(prisma.book, 'delete');

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

        await prisma.book.create({
            data: {
                id: '1',
                name: 'Book 1',
                publisherId: '1',
                editionNumber: 3,
                editionDescription: 'Book 1 description',
                editionYear: 2023,
                quantity: 3,
                available: 1,
                pages: 200,
            },
        });

        await booksRepository.delete('1');
        expect(prisma.book.delete).toHaveBeenCalledWith({
            where: {
                id: '1',
            },
        });
    });
});
