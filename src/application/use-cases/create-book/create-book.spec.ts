import { Book } from '@domain/entities/book';
import { CreateBookUseCase } from './create-book';
import { BookAuthors } from '@domain/value-objects/book-authors';
import { BookEdition } from '@domain/value-objects/book-edition';
import { BookAlreadyExistsError } from '@usecase/@errors/book-already-exists-error';
import { AuthorDoesNotExistsError } from '@usecase/@errors/author-does-not-exists-error';
import { PublisherDoesNotExistsError } from '@usecase/@errors/publisher-does-not-exists-error';
import { Publisher } from '@domain/entities/publisher';
import { BookPublisher } from '@domain/value-objects/book-publisher';

const BooksMockRepository = () => {
    return {
        findById: vi.fn(),
        findByName: vi.fn().mockReturnValue(Promise.resolve(null)),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        addBookToStock: vi.fn(),
        removeBookFromStock: vi.fn(),
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

describe('[UT] - Create book use case', () => {
    it('should create a book', async () => {
        const booksRepository = BooksMockRepository();
        const authorsRepository = AuthorsMockRepository();
        const publishersRepository = PublishersMockRepository();
        const createBookUseCase = new CreateBookUseCase(
            booksRepository,
            authorsRepository,
            publishersRepository,
        );

        const book = {
            name: 'Book 1',
            authors: [
                {
                    id: '1',
                    name: 'Author 1',
                },
                {
                    id: '2',
                    name: 'Author 2',
                },
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

        const result = await createBookUseCase.execute(book);

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
    });

    it('should return a message error when the book name already exists', async () => {
        const booksRepository = BooksMockRepository();
        const authorsRepository = AuthorsMockRepository();
        const publishersRepository = PublishersMockRepository();

        const book = new Book({
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
        });

        booksRepository.findByName.mockReturnValue(
            Promise.resolve(new Book(book)),
        );

        const createBookUseCase = new CreateBookUseCase(
            booksRepository,
            authorsRepository,
            publishersRepository,
        );

        const result = await createBookUseCase.execute({
            name: 'Book 1',
            authors: [
                {
                    id: '1',
                    name: 'Author 1',
                },
                {
                    id: '2',
                    name: 'Author 2',
                },
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
        });

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(BookAlreadyExistsError);
    });

    it('should return a message error when an author does not exists', async () => {
        const booksRepository = BooksMockRepository();
        const authorsRepository = AuthorsMockRepository();
        const publishersRepository = PublishersMockRepository();

        authorsRepository.validateManyIds.mockReturnValue(
            Promise.resolve(false),
        );

        const createBookUseCase = new CreateBookUseCase(
            booksRepository,
            authorsRepository,
            publishersRepository,
        );

        const result = await createBookUseCase.execute({
            name: 'Book 1',
            authors: [
                {
                    id: '1',
                    name: 'Author 1',
                },
                {
                    id: '2',
                    name: 'Author 2',
                },
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
        });

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(AuthorDoesNotExistsError);
    });

    it('should return a message error when publisher does not exists', async () => {
        const booksRepository = BooksMockRepository();
        const authorsRepository = AuthorsMockRepository();
        const publishersRepository = PublishersMockRepository();

        publishersRepository.findById.mockReturnValue(Promise.resolve(null));

        const createBookUseCase = new CreateBookUseCase(
            booksRepository,
            authorsRepository,
            publishersRepository,
        );

        const result = await createBookUseCase.execute({
            name: 'Book 1',
            authors: [
                {
                    id: '1',
                    name: 'Author 1',
                },
                {
                    id: '2',
                    name: 'Author 2',
                },
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
        });

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(PublisherDoesNotExistsError);
    });
});
