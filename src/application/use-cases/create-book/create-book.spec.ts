import { CreateBookUseCase } from './create-book';
import { BookAlreadyExistsError } from '@usecase/@errors/book-already-exists-error';
import { AuthorDoesNotExistsError } from '@usecase/@errors/author-does-not-exists-error';
import { PublisherDoesNotExistsError } from '@usecase/@errors/publisher-does-not-exists-error';
import { BooksMockRepository } from '@mocks/mock-books-repository';
import { BookAuthorsMockRepository } from '@mocks/mock-book-authors-repository';
import { AuthorsMockRepository } from '@mocks/mock-authors-repository';
import { PublishersMockRepository } from '@mocks/mock-publishers-repository';
import { FakePublisherFactory } from 'test/factories/fake-publisher-factory';
import { FakeBookFactory } from 'test/factories/fake-book-factory';

let booksRepository: ReturnType<typeof BooksMockRepository>;
let bookAuthorsRepository: ReturnType<typeof BookAuthorsMockRepository>;
let authorsRepository: ReturnType<typeof AuthorsMockRepository>;
let publishersRepository: ReturnType<typeof PublishersMockRepository>;

describe('[UT] - Create book use case', () => {
    beforeEach(() => {
        booksRepository = BooksMockRepository();
        bookAuthorsRepository = BookAuthorsMockRepository();
        authorsRepository = AuthorsMockRepository();
        publishersRepository = PublishersMockRepository();
    });

    it('should create a book', async () => {
        const publisher = FakePublisherFactory.create();
        const book = FakeBookFactory.create();

        authorsRepository.validateManyIds.mockResolvedValue(true);
        publishersRepository.findById.mockResolvedValue(publisher);

        vi.spyOn(bookAuthorsRepository, 'create');

        const createBookUseCase = new CreateBookUseCase(
            booksRepository,
            bookAuthorsRepository,
            authorsRepository,
            publishersRepository,
        );

        const result = await createBookUseCase.execute({
            name: book.name,
            authors: [
                {
                    id: book.authors[0].id,
                    name: book.authors[0].name,
                },
            ],
            publisher: {
                id: book.publisher.id,
                name: book.publisher.name,
            },
            editionNumber: book.edition.number,
            editionDescription: book.edition.description,
            editionYear: book.edition.year,
            quantity: book.quantity,
            pages: book.pages,
        });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toMatchObject({
            id: expect.any(String),
            name: book.name,
            authors: [
                {
                    id: book.authors[0].id,
                    name: book.authors[0].name,
                },
            ],
            publisher: {
                id: book.publisher.id,
                name: book.publisher.name,
            },
            editionNumber: book.edition.number,
            editionDescription: book.edition.description,
            editionYear: book.edition.year,
            quantity: book.quantity,
            available: book.quantity,
            pages: book.pages,
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
        });
        expect(bookAuthorsRepository.create).toHaveBeenCalledOnce();
    });

    it('should return a message error when the book name already exists', async () => {
        const book = FakeBookFactory.create();

        booksRepository.findByName.mockResolvedValue(book);

        const createBookUseCase = new CreateBookUseCase(
            booksRepository,
            bookAuthorsRepository,
            authorsRepository,
            publishersRepository,
        );

        const result = await createBookUseCase.execute({
            name: book.name,
            authors: [
                {
                    id: book.authors[0].id,
                    name: book.authors[0].name,
                },
            ],
            publisher: {
                id: book.publisher.id,
                name: book.publisher.name,
            },
            editionNumber: book.edition.number,
            editionDescription: book.edition.description,
            editionYear: book.edition.year,
            quantity: book.quantity,
            pages: book.pages,
        });

        expect(result.isLeft()).toBeTruthy();
        expect(result.value).toBeInstanceOf(BookAlreadyExistsError);
    });

    it('should return a message error when an author does not exists', async () => {
        const book = FakeBookFactory.create();

        authorsRepository.validateManyIds.mockResolvedValue(false);

        const createBookUseCase = new CreateBookUseCase(
            booksRepository,
            bookAuthorsRepository,
            authorsRepository,
            publishersRepository,
        );

        const result = await createBookUseCase.execute({
            name: book.name,
            authors: [
                {
                    id: book.authors[0].id,
                    name: book.authors[0].name,
                },
            ],
            publisher: {
                id: book.publisher.id,
                name: book.publisher.name,
            },
            editionNumber: book.edition.number,
            editionDescription: book.edition.description,
            editionYear: book.edition.year,
            quantity: book.quantity,
            pages: book.pages,
        });

        expect(result.isLeft()).toBeTruthy();
        expect(result.value).toBeInstanceOf(AuthorDoesNotExistsError);
    });

    it('should return a message error when publisher does not exists', async () => {
        const book = FakeBookFactory.create();

        authorsRepository.validateManyIds.mockResolvedValue(true);

        const createBookUseCase = new CreateBookUseCase(
            booksRepository,
            bookAuthorsRepository,
            authorsRepository,
            publishersRepository,
        );

        const result = await createBookUseCase.execute({
            name: book.name,
            authors: [
                {
                    id: book.authors[0].id,
                    name: book.authors[0].name,
                },
            ],
            publisher: {
                id: book.publisher.id,
                name: book.publisher.name,
            },
            editionNumber: book.edition.number,
            editionDescription: book.edition.description,
            editionYear: book.edition.year,
            quantity: book.quantity,
            pages: book.pages,
        });

        expect(result.isLeft()).toBeTruthy();
        expect(result.value).toBeInstanceOf(PublisherDoesNotExistsError);
    });
});
