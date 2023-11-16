import {
    startEnvironment,
    stopEnvironment,
} from 'test/utils/test-environment-setup';
import { PrismaService } from '../prisma.service';
import { PrismaBookAuthorsRepository } from './prisma-book-authors-repository';

let prisma: PrismaService;
let bookAuthorsRepository: PrismaBookAuthorsRepository;

describe('[UT] - Book Authors repository', () => {
    beforeEach(() => {
        prisma = new PrismaService();
        startEnvironment();
        bookAuthorsRepository = new PrismaBookAuthorsRepository(prisma);
    });

    afterEach(async () => {
        await stopEnvironment(prisma);
    });

    it('should create a book-author relationship ', async () => {
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

        await prisma.author.create({
            data: {
                id: '2',
                name: 'Author 2',
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

        vi.spyOn(prisma.bookAuthors, 'createMany');

        await bookAuthorsRepository.create('1', ['1', '2']);

        expect(prisma.bookAuthors.createMany).toHaveBeenCalledWith({
            data: [
                {
                    bookId: '1',
                    authorId: '1',
                },
                {
                    bookId: '1',
                    authorId: '2',
                },
            ],
        });
    });

    it('should delete a book-author relationship ', async () => {
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

        await prisma.author.create({
            data: {
                id: '2',
                name: 'Author 2',
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

        vi.spyOn(prisma.bookAuthors, 'deleteMany');

        await prisma.bookAuthors.create({
            data: {
                bookId: '1',
                authorId: '1',
            },
        });

        await bookAuthorsRepository.delete('1');

        expect(prisma.bookAuthors.deleteMany).toHaveBeenCalledWith({
            where: {
                bookId: '1',
            },
        });
    });
});
