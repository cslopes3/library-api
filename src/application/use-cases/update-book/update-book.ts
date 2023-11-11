import { BooksRepository } from '@repository/books-repository';
import { UpdateBookInputDto, UpdateBookOutputDto } from './update-book-dto';
import { Either, left, right } from '@shared/errors/either';
import { AuthorsRepository } from '@repository/authors-repository';
import { BookAlreadyExistsError } from '@usecase/@errors/book-already-exists-error';
import { ResourceNotFoundError } from '@usecase/@errors/resource-not-found-error';
import { BookAuthors } from '@domain/value-objects/book-authors';
import { BookEdition } from '@domain/value-objects/book-edition';
import { AuthorDoesNotExistsError } from '@usecase/@errors/author-does-not-exists-error';
import { PublishersRepository } from '@repository/publishers-repository';
import { PublisherDoesNotExistsError } from '@usecase/@errors/publisher-does-not-exists-error';
import { BookPublisher } from '@domain/value-objects/book-publisher';
import { BookAuthorsRepository } from '@repository/book-authors-repository';

export class UpdateBookUseCase {
    constructor(
        private booksRepository: BooksRepository,
        private bookAuthorsRepository: BookAuthorsRepository,
        private authorsRepository: AuthorsRepository,
        private publishersRepository: PublishersRepository,
    ) {}

    async execute({
        id,
        name,
        authors,
        publisher,
        editionNumber,
        editionDescription,
        editionYear,
        pages,
    }: UpdateBookInputDto): Promise<
        Either<
            | ResourceNotFoundError
            | BookAlreadyExistsError
            | AuthorDoesNotExistsError
            | PublisherDoesNotExistsError,
            UpdateBookOutputDto
        >
    > {
        const book = await this.booksRepository.findById(id);

        if (!book) {
            return left(new ResourceNotFoundError());
        }

        const bookWithSameName = await this.booksRepository.findByName(name);

        if (bookWithSameName && bookWithSameName.id !== book.id) {
            return left(new BookAlreadyExistsError(name));
        }

        const validated = await this.authorsRepository.validateManyIds(
            authors.map((author) => author.id.toString()),
        );

        if (!validated) {
            return left(new AuthorDoesNotExistsError());
        }

        const publisherExists = await this.publishersRepository.findById(
            publisher.id,
        );

        if (!publisherExists) {
            return left(new PublisherDoesNotExistsError());
        }

        book.changeName(name);
        book.changeAuthors(
            authors.map((author) => new BookAuthors(author.id, author.name)),
        );
        book.changePublisher(new BookPublisher(publisher.id, publisher.name));
        book.changeEdition(
            new BookEdition(editionNumber, editionDescription, editionYear),
        );
        book.changePages(pages);

        await this.booksRepository.update(book);
        await this.bookAuthorsRepository.delete(book.id.toString());
        await this.bookAuthorsRepository.create(
            book.id.toString(),
            book.authors.map((author) => author.id),
        );

        return right({
            id: book.id.toString(),
            name: book.name,
            authors: book.authors.map((author) => ({
                id: author.id.toString(),
                name: author.name,
            })),
            publisher: {
                id: book.publisher.id,
                name: book.publisher.name,
            },
            editionNumber: book.edition.number,
            editionDescription: book.edition.description,
            editionYear: book.edition.year,
            quantity: book.quantity,
            available: book.available,
            pages: book.pages,
            createdAt: book.createdAt,
            updatedAt: book.updatedAt,
        });
    }
}
