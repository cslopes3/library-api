import { PrismaService } from '@infra/database/prisma/prisma.service';
import { PrismaBookAuthorsRepository } from '@infra/database/prisma/repositories/prisma-book-authors-repository';
import { PrismaBooksRepository } from '@infra/database/prisma/repositories/prisma-books-repository';
import { DeleteBookUseCase } from '@usecase/delete-book/delete-book';
import {
    startEnvironment,
    stopEnvironment,
} from 'test/utils/test-environment-setup';

let prisma: PrismaService;
let booksRepository: PrismaBooksRepository;
let bookAuthorsRepository: PrismaBookAuthorsRepository;
let deleteBookUseCase: DeleteBookUseCase;

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
    });

    afterEach(async () => {
        await stopEnvironment(prisma);
    });

    it('should delete book', async () => {
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

        await prisma.bookAuthors.create({
            data: {
                bookId: '1',
                authorId: '1',
            },
        });

        vi.spyOn(bookAuthorsRepository, 'delete');

        const result = await deleteBookUseCase.execute({
            id: '1',
        });

        expect(result.isRight()).toBeTruthy();
        expect(bookAuthorsRepository.delete).toHaveBeenCalledWith('1');
    });
});
