import {
    startEnvironment,
    stopEnvironment,
} from 'test/utils/test-environment-setup';
import { PrismaService } from '../prisma.service';
import { PrismaBookAuthorsRepository } from './prisma-book-authors-repository';
import { PrismaFakePublisher } from 'test/factories/fake-publisher-factory';
import { PrismaFakeBook } from 'test/factories/fake-book-factory';
import { PrismaFakeAuthor } from 'test/factories/fake-author-factory';
import { BookPublisher } from '@domain/value-objects/book-publisher';

let prisma: PrismaService;
let bookAuthorsRepository: PrismaBookAuthorsRepository;
let prismaFakePublisher: PrismaFakePublisher;
let prismaFakeAuthor: PrismaFakeAuthor;
let prismaFakeBook: PrismaFakeBook;

describe('[UT] - Book Authors repository', () => {
    beforeEach(() => {
        prisma = new PrismaService();
        startEnvironment();
        bookAuthorsRepository = new PrismaBookAuthorsRepository(prisma);

        prismaFakePublisher = new PrismaFakePublisher(prisma);
        prismaFakeAuthor = new PrismaFakeAuthor(prisma);
        prismaFakeBook = new PrismaFakeBook(prisma);
    });

    afterEach(async () => {
        await stopEnvironment(prisma);
    });

    it('should create a book-author relationship ', async () => {
        const publisher = await prismaFakePublisher.create();
        const author = await prismaFakeAuthor.create();
        const author2 = await prismaFakeAuthor.create({ name: 'Author 2' });
        const book = await prismaFakeBook.create({
            publisher: new BookPublisher(
                publisher.id.toString(),
                publisher.name,
            ),
        });

        vi.spyOn(prisma.bookAuthors, 'createMany');

        await bookAuthorsRepository.create(book.id.toString(), [
            author.id.toString(),
            author2.id.toString(),
        ]);

        expect(prisma.bookAuthors.createMany).toHaveBeenCalledWith({
            data: [
                {
                    bookId: book.id.toString(),
                    authorId: author.id.toString(),
                },
                {
                    bookId: book.id.toString(),
                    authorId: author2.id.toString(),
                },
            ],
        });
    });

    it('should delete a book-author relationship ', async () => {
        const publisher = await prismaFakePublisher.create();
        const author = await prismaFakeAuthor.create();
        const author2 = await prismaFakeAuthor.create({ name: 'Author 2' });
        const book = await prismaFakeBook.create({
            publisher: new BookPublisher(
                publisher.id.toString(),
                publisher.name,
            ),
        });

        vi.spyOn(prisma.bookAuthors, 'deleteMany');

        await prisma.bookAuthors.createMany({
            data: [
                {
                    bookId: book.id.toString(),
                    authorId: author.id.toString(),
                },
                {
                    bookId: book.id.toString(),
                    authorId: author2.id.toString(),
                },
            ],
        });

        await bookAuthorsRepository.delete(book.id.toString());

        expect(prisma.bookAuthors.deleteMany).toHaveBeenCalledWith({
            where: {
                bookId: book.id.toString(),
            },
        });
    });
});
