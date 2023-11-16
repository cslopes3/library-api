import { PrismaService } from '@infra/database/prisma/prisma.service';
import { PrismaAuthorsRepository } from '@infra/database/prisma/repositories/prisma-authors-repository';
import { PrismaBookAuthorsRepository } from '@infra/database/prisma/repositories/prisma-book-authors-repository';
import { PrismaBooksRepository } from '@infra/database/prisma/repositories/prisma-books-repository';
import { PrismaPublishersRepository } from '@infra/database/prisma/repositories/prisma-publishers-repository';
import { UpdateBookUseCase } from '@usecase/update-book/update-book';
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
    });

    afterEach(async () => {
        await stopEnvironment(prisma);
    });

    it('should update a book', async () => {
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
                editionNumber: 1,
                editionDescription: 'Description',
                editionYear: 2023,
                quantity: 10,
                available: 10,
                pages: 100,
                publisherId: '1',
            },
        });

        vi.spyOn(bookAuthorsRepository, 'create');
        vi.spyOn(bookAuthorsRepository, 'delete');

        const result = await updateBookUseCase.execute({
            id: '1',
            name: 'Book 1',
            authors: [{ id: '1', name: 'Author 1' }],
            publisher: { id: '1', name: 'Publisher 1' },
            editionNumber: 2,
            editionDescription: 'Description updated',
            editionYear: 2023,
            pages: 100,
        });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toEqual({
            id: '1',
            name: 'Book 1',
            authors: [{ id: '1', name: 'Author 1' }],
            publisher: { id: '1', name: 'Publisher 1' },
            editionNumber: 2,
            editionDescription: 'Description updated',
            editionYear: 2023,
            quantity: expect.any(Number),
            available: expect.any(Number),
            pages: 100,
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
        });
        expect(bookAuthorsRepository.delete).toHaveBeenCalledWith('1');
        expect(bookAuthorsRepository.create).toHaveBeenCalledOnce();
    });
});
