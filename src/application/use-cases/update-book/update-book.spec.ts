import { Book } from '@domain/entities/book';
import { UpdateBookUseCase } from './update-book';
import { BookAuthors } from '@domain/value-objects/book-authors';
import { BookEdition } from '@domain/value-objects/book-edition';
import { BookAlreadyExistsError } from '@usecase/@errors/book-already-exists-error';
import { AuthorDoesNotExistsError } from '@usecase/@errors/author-does-not-exists-error';
import { ResourceNotFoundError } from '@usecase/@errors/resource-not-found-error';
import { PublisherDoesNotExistsError } from '@usecase/@errors/publisher-does-not-exists-error';
import { Publisher } from '@domain/entities/publisher';
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

const BookMockRepository = () => {
    return {
        findById: vi.fn().mockReturnValue(Promise.resolve(book)),
        findByName: vi.fn().mockReturnValue(Promise.resolve(null)),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        addBookToStock: vi.fn(),
        removeBookFromStock: vi.fn(),
    };
};

const BookAuthorsMockRepository = () => {
    return {
        create: vi.fn(),
        delete: vi.fn(),
    };
};

const AuthorsMockRepository = () => {
    return {
        findById: vi.fn(),
        findByName: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        validateManyIds: vi.fn().mockReturnValue(Promise.resolve(true)),
    };
};

const publisher = new Publisher({ name: 'Publisher Name' });

const PublishersMockRepository = () => {
    return {
        findById: vi.fn().mockReturnValue(Promise.resolve(publisher)),
        findByName: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    };
};

describe('[UT] - Update book use case', () => {
    it('should update a book', async () => {
        const booksRepository = BookMockRepository();
        const bookAuthorsRepository = BookAuthorsMockRepository();
        const authorsRepository = AuthorsMockRepository();
        const publishersRepository = PublishersMockRepository();
        const updateBookUseCase = new UpdateBookUseCase(
            booksRepository,
            bookAuthorsRepository,
            authorsRepository,
            publishersRepository,
        );

        vi.spyOn(bookAuthorsRepository, 'create');
        vi.spyOn(bookAuthorsRepository, 'delete');

        const book = {
            id: '1',
            name: 'Book 1',
            authors: [
                { id: '1', name: 'Author 1' },
                { id: '2', name: 'Author 2' },
            ],
            publisher: {
                id: '1',
                name: 'Publisher 1',
            },
            editionNumber: 3,
            editionDescription: 'Book 1 description',
            editionYear: 2023,
            quantity: 3,
            pages: 200,
        };

        const result = await updateBookUseCase.execute(book);

        expect(result.isRight()).toBe(true);
        expect(result.value).toEqual({
            id: expect.any(String),
            name: book.name,
            authors: book.authors,
            publisher: book.publisher,
            editionNumber: book.editionNumber,
            editionDescription: book.editionDescription,
            editionYear: book.editionYear,
            quantity: book.quantity,
            available: book.quantity,
            pages: book.pages,
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
        });
        expect(bookAuthorsRepository.delete).toHaveBeenCalledWith(
            book.id.toString(),
        );
        expect(bookAuthorsRepository.create).toHaveBeenCalledOnce();
    });

    it('should return a message error when the book name already exists', async () => {
        const booksRepository = BookMockRepository();
        const bookAuthorsRepository = BookAuthorsMockRepository();
        const authorsRepository = AuthorsMockRepository();
        const publishersRepository = PublishersMockRepository();

        booksRepository.findByName.mockReturnValue(
            Promise.resolve(new Book(book)),
        );

        const updateBookUseCase = new UpdateBookUseCase(
            booksRepository,
            bookAuthorsRepository,
            authorsRepository,
            publishersRepository,
        );

        const result = await updateBookUseCase.execute({
            id: '1',
            name: 'Book 1',
            authors: [
                { id: '1', name: 'Author 1' },
                { id: '2', name: 'Author 2' },
            ],
            publisher: {
                id: '1',
                name: 'Publisher 1',
            },
            editionNumber: 3,
            editionDescription: 'Book 1 description',
            editionYear: 2023,
            pages: 200,
        });

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(BookAlreadyExistsError);
    });

    it('should return a message error when an author does not exists', async () => {
        const booksRepository = BookMockRepository();
        const bookAuthorsRepository = BookAuthorsMockRepository();
        const authorsRepository = AuthorsMockRepository();
        const publishersRepository = PublishersMockRepository();

        authorsRepository.validateManyIds.mockReturnValue(
            Promise.resolve(false),
        );

        const updateBookUseCase = new UpdateBookUseCase(
            booksRepository,
            bookAuthorsRepository,
            authorsRepository,
            publishersRepository,
        );

        const result = await updateBookUseCase.execute({
            id: '1',
            name: 'Book 1',
            authors: [
                { id: '1', name: 'Author 1' },
                { id: '2', name: 'Author 2' },
            ],
            publisher: {
                id: '1',
                name: 'Publisher 1',
            },
            editionNumber: 3,
            editionDescription: 'Book 1 description',
            editionYear: 2023,
            pages: 200,
        });

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(AuthorDoesNotExistsError);
    });

    it('should return error when book is not found', async () => {
        const booksRepository = BookMockRepository();
        const bookAuthorsRepository = BookAuthorsMockRepository();
        const authorsRepository = AuthorsMockRepository();
        const publishersRepository = PublishersMockRepository();

        booksRepository.findById.mockReturnValue(Promise.resolve(null));

        const updateBookUseCase = new UpdateBookUseCase(
            booksRepository,
            bookAuthorsRepository,
            authorsRepository,
            publishersRepository,
        );

        const result = await updateBookUseCase.execute({
            id: '1',
            name: 'Book 1',
            authors: [
                { id: '1', name: 'Author 1' },
                { id: '2', name: 'Author 2' },
            ],
            publisher: {
                id: '1',
                name: 'Publisher 1',
            },
            editionNumber: 3,
            editionDescription: 'Book 1 description',
            editionYear: 2023,
            pages: 200,
        });

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(ResourceNotFoundError);
    });

    it('should return a message error when publisher does not exists', async () => {
        const booksRepository = BookMockRepository();
        const bookAuthorsRepository = BookAuthorsMockRepository();
        const authorsRepository = AuthorsMockRepository();
        const publishersRepository = PublishersMockRepository();

        publishersRepository.findById.mockReturnValue(Promise.resolve(null));

        const updateBookUseCase = new UpdateBookUseCase(
            booksRepository,
            bookAuthorsRepository,
            authorsRepository,
            publishersRepository,
        );

        const result = await updateBookUseCase.execute({
            id: '1',
            name: 'Book 1',
            authors: [
                { id: '1', name: 'Author 1' },
                { id: '2', name: 'Author 2' },
            ],
            publisher: {
                id: '1',
                name: 'Publisher 1',
            },
            editionNumber: 3,
            editionDescription: 'Book 1 description',
            editionYear: 2023,
            pages: 200,
        });

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(PublisherDoesNotExistsError);
    });
});
