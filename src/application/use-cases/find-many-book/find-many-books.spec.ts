import { Book } from '@domain/entities/book';
import { BookAuthors } from '@domain/value-objects/book-authors';
import { BookEdition } from '@domain/value-objects/book-edition';
import { FindManyBooksUseCase } from './find-many-books';
import { BookPublisher } from '@domain/value-objects/book-publisher';

const book: Book[] = [];

book.push(
    new Book(
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
        new Date(2023, 0, 1),
    ),
);

book.push(
    new Book(
        {
            name: 'Book 2',
            authors: [
                new BookAuthors('1', 'Author 1'),
                new BookAuthors('2', 'Author 2'),
            ],
            publisher: new BookPublisher('1', 'Publisher 1'),
            edition: new BookEdition(3, 'Book 2 description', 2023),
            quantity: 3,
            available: 3,
            pages: 200,
        },
        '1',
        new Date(2023, 0, 10),
    ),
);

book.push(
    new Book(
        {
            name: 'Book 3',
            authors: [
                new BookAuthors('1', 'Author 1'),
                new BookAuthors('2', 'Author 2'),
            ],
            publisher: new BookPublisher('1', 'Publisher 1'),
            edition: new BookEdition(3, 'Book 3 description', 2023),
            quantity: 3,
            available: 3,
            pages: 200,
        },
        '1',
        new Date(2023, 0, 20),
    ),
);

const MockRepository = () => {
    return {
        findById: vi.fn(),
        findByName: vi.fn(),
        findMany: vi.fn().mockReturnValue(Promise.resolve(book)),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        addBookToStock: vi.fn(),
        removeBookFromStock: vi.fn(),
    };
};

describe('[UT] - Find many books use case', () => {
    it('should find many books', async () => {
        const booksRepository = MockRepository();
        const findManyBooksUseCase = new FindManyBooksUseCase(booksRepository);

        const result = await findManyBooksUseCase.execute({
            params: {
                page: 1,
            },
        });

        expect(result.isRight()).toBe(true);
        expect(result.value).toHaveLength(3);
        expect(result.value).toEqual([
            expect.objectContaining({
                name: 'Book 1',
                createdAt: new Date(2023, 0, 1),
            }),
            expect.objectContaining({
                name: 'Book 2',
                createdAt: new Date(2023, 0, 10),
            }),
            expect.objectContaining({
                name: 'Book 3',
                createdAt: new Date(2023, 0, 20),
            }),
        ]);
    });

    it('should return an empty array when not found a book', async () => {
        const booksRepository = MockRepository();
        booksRepository.findMany.mockReturnValue(Promise.resolve([]));

        const findManyBooksUseCase = new FindManyBooksUseCase(booksRepository);

        const result = await findManyBooksUseCase.execute({
            params: {
                page: 2,
            },
        });

        expect(result.isRight()).toBe(true);
        expect(result.value).toHaveLength(0);
    });
});
