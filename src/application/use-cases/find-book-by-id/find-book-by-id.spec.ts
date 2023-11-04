import { Book } from '@domain/entities/book';
import { BookAuthors } from '@domain/value-objects/book-authors';
import { BookEdition } from '@domain/value-objects/book-edition';
import { FindBookByIdUseCase } from './find-book-by-id';
import { BookPublisher } from '@domain/value-objects/book-publisher';

const book = new Book(
    {
        name: 'Book 1',
        authors: [
            new BookAuthors('1', 'Author 1'),
            new BookAuthors('2', 'Author 2'),
        ],
        publisher: new BookPublisher('1', 'Publisher 1'),
        edition: new BookEdition(3, 'Book 1 description', 2023),
        quantity: 3,
        available: 3,
        pages: 200,
    },
    '1',
);

const MockRepository = () => {
    return {
        findById: vi.fn().mockReturnValue(Promise.resolve(book)),
        findByName: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        addBookToStock: vi.fn(),
        removeBookFromStock: vi.fn(),
    };
};

describe('[UT] - Find book by id use case', () => {
    it('should find a book', async () => {
        const booksRepository = MockRepository();

        const findBookByIdUseCase = new FindBookByIdUseCase(booksRepository);

        const result = await findBookByIdUseCase.execute({ id: '1' });

        expect(result.isRight()).toBe(true);
        expect(result.value?.name).toBe('Book 1');
    });

    it('should return null when a book is not find', async () => {
        const booksRepository = MockRepository();
        booksRepository.findById.mockReturnValue(Promise.resolve(null));

        const findBookByIdUseCase = new FindBookByIdUseCase(booksRepository);

        const result = await findBookByIdUseCase.execute({ id: '1' });

        expect(result.isRight()).toBe(true);
        expect(result.value).toBeNull();
    });
});
