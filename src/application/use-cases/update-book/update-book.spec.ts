import { UpdateBookUseCase } from './update-book';
import { BookAlreadyExistsError } from '@usecase/@errors/book-already-exists-error';
import { AuthorDoesNotExistsError } from '@usecase/@errors/author-does-not-exists-error';
import { ResourceNotFoundError } from '@usecase/@errors/resource-not-found-error';
import { PublisherDoesNotExistsError } from '@usecase/@errors/publisher-does-not-exists-error';
import { FakeBookFactory } from 'test/factories/fake-book-factory';
import { BooksMockRepository } from '@mocks/mock-books-repository';
import { AuthorsMockRepository } from '@mocks/mock-authors-repository';
import { BookAuthorsMockRepository } from '@mocks/mock-book-authors-repository';
import { PublishersMockRepository } from '@mocks/mock-publishers-repository';
import { FakePublisherFactory } from 'test/factories/fake-publisher-factory';
import { BookPublisher } from '@domain/value-objects/book-publisher';

let booksRepository: ReturnType<typeof BooksMockRepository>;
let bookAuthorsRepository: ReturnType<typeof BookAuthorsMockRepository>;
let authorsRepository: ReturnType<typeof AuthorsMockRepository>;
let publishersRepository: ReturnType<typeof PublishersMockRepository>;

describe('[UT] - Update book use case', () => {
    beforeEach(() => {
        booksRepository = BooksMockRepository();
        bookAuthorsRepository = BookAuthorsMockRepository();
        authorsRepository = AuthorsMockRepository();
        publishersRepository = PublishersMockRepository();
    });

    it('should update a book', async () => {
        const publisher = FakePublisherFactory.create();
        const book = FakeBookFactory.create({
            publisher: new BookPublisher(
                publisher.id.toString(),
                publisher.name,
            ),
        });

        booksRepository.findById.mockResolvedValue(book);
        authorsRepository.validateManyIds.mockResolvedValue(true);
        publishersRepository.findById.mockResolvedValue(publisher);

        const updateBookUseCase = new UpdateBookUseCase(
            booksRepository,
            bookAuthorsRepository,
            authorsRepository,
            publishersRepository,
        );

        vi.spyOn(bookAuthorsRepository, 'create');
        vi.spyOn(bookAuthorsRepository, 'delete');

        const result = await updateBookUseCase.execute({
            id: book.id.toString(),
            name: book.name,
            authors: [{ id: book.authors[0].id, name: book.authors[0].name }],
            publisher: { id: book.publisher.id, name: book.publisher.name },
            editionNumber: book.edition.number,
            editionDescription: book.edition.description,
            editionYear: book.edition.year,
            pages: book.pages,
        });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toEqual({
            id: book.id.toString(),
            name: book.name,
            authors: [{ id: book.authors[0].id, name: book.authors[0].name }],
            publisher: { id: book.publisher.id, name: book.publisher.name },
            editionNumber: book.edition.number,
            editionDescription: book.edition.description,
            editionYear: book.edition.year,
            quantity: expect.any(Number),
            available: expect.any(Number),
            pages: book.pages,
            createdAt: book.createdAt,
            updatedAt: expect.any(Date),
        });
        expect(bookAuthorsRepository.delete).toHaveBeenCalledWith(
            book.id.toString(),
        );
        expect(bookAuthorsRepository.create).toHaveBeenCalledOnce();
    });

    it('should return a message error when the book name already exists', async () => {
        const book = FakeBookFactory.create();
        const bookWithSameName = FakeBookFactory.create({}, '2');

        booksRepository.findById.mockResolvedValue(book);
        booksRepository.findByName.mockResolvedValue(bookWithSameName);

        const updateBookUseCase = new UpdateBookUseCase(
            booksRepository,
            bookAuthorsRepository,
            authorsRepository,
            publishersRepository,
        );

        const result = await updateBookUseCase.execute({
            id: book.id.toString(),
            name: book.name,
            authors: [{ id: book.authors[0].id, name: book.authors[0].name }],
            publisher: { id: book.publisher.id, name: book.publisher.name },
            editionNumber: book.edition.number,
            editionDescription: book.edition.description,
            editionYear: book.edition.year,
            pages: book.pages,
        });

        expect(result.isLeft()).toBeTruthy();
        expect(result.value).toBeInstanceOf(BookAlreadyExistsError);
    });

    it('should return a message error when an author does not exists', async () => {
        const book = FakeBookFactory.create();

        booksRepository.findById.mockResolvedValue(book);
        authorsRepository.validateManyIds.mockResolvedValue(false);

        const updateBookUseCase = new UpdateBookUseCase(
            booksRepository,
            bookAuthorsRepository,
            authorsRepository,
            publishersRepository,
        );

        const result = await updateBookUseCase.execute({
            id: book.id.toString(),
            name: book.name,
            authors: [{ id: book.authors[0].id, name: book.authors[0].name }],
            publisher: { id: book.publisher.id, name: book.publisher.name },
            editionNumber: book.edition.number,
            editionDescription: book.edition.description,
            editionYear: book.edition.year,
            pages: book.pages,
        });

        expect(result.isLeft()).toBeTruthy();
        expect(result.value).toBeInstanceOf(AuthorDoesNotExistsError);
    });

    it('should return error when book is not found', async () => {
        const book = FakeBookFactory.create();

        const updateBookUseCase = new UpdateBookUseCase(
            booksRepository,
            bookAuthorsRepository,
            authorsRepository,
            publishersRepository,
        );

        const result = await updateBookUseCase.execute({
            id: book.id.toString(),
            name: book.name,
            authors: [{ id: book.authors[0].id, name: book.authors[0].name }],
            publisher: { id: book.publisher.id, name: book.publisher.name },
            editionNumber: book.edition.number,
            editionDescription: book.edition.description,
            editionYear: book.edition.year,
            pages: book.pages,
        });

        expect(result.isLeft()).toBeTruthy();
        expect(result.value).toBeInstanceOf(ResourceNotFoundError);
    });

    it('should return a message error when publisher does not exists', async () => {
        const book = FakeBookFactory.create();

        booksRepository.findById.mockResolvedValue(book);
        authorsRepository.validateManyIds.mockResolvedValue(true);

        const updateBookUseCase = new UpdateBookUseCase(
            booksRepository,
            bookAuthorsRepository,
            authorsRepository,
            publishersRepository,
        );

        const result = await updateBookUseCase.execute({
            id: book.id.toString(),
            name: book.name,
            authors: [{ id: book.authors[0].id, name: book.authors[0].name }],
            publisher: { id: book.publisher.id, name: book.publisher.name },
            editionNumber: book.edition.number,
            editionDescription: book.edition.description,
            editionYear: book.edition.year,
            pages: book.pages,
        });

        expect(result.isLeft()).toBeTruthy();
        expect(result.value).toBeInstanceOf(PublisherDoesNotExistsError);
    });
});
