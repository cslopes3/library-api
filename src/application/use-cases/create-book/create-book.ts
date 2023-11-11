import { BooksRepository } from '@repository/books-repository';
import { CreateBookInputDto, CreateBookOutputDto } from './create-book-dto';
import { Either, left, right } from '@shared/errors/either';
import { Book } from '@domain/entities/book';
import { BookAuthors } from '@domain/value-objects/book-authors';
import { BookEdition } from '@domain/value-objects/book-edition';
import { AuthorsRepository } from '@repository/authors-repository';
import { BookAlreadyExistsError } from '@usecase/@errors/book-already-exists-error';
import { AuthorDoesNotExistsError } from '@usecase/@errors/author-does-not-exists-error';
import { PublishersRepository } from '@repository/publishers-repository';
import { PublisherDoesNotExistsError } from '@usecase/@errors/publisher-does-not-exists-error';
import { BookPublisher } from '@domain/value-objects/book-publisher';
import { BookAuthorsRepository } from '@repository/book-authors-repository';

export class CreateBookUseCase {
    constructor(
        private booksRepository: BooksRepository,
        private bookAuthorsRepository: BookAuthorsRepository,
        private authorsRepository: AuthorsRepository,
        private publishersRepository: PublishersRepository,
    ) {}

    async execute({
        name,
        authors,
        publisher,
        editionDescription,
        editionNumber,
        editionYear,
        quantity,
        pages,
    }: CreateBookInputDto): Promise<
        Either<
            | BookAlreadyExistsError
            | AuthorDoesNotExistsError
            | PublisherDoesNotExistsError,
            CreateBookOutputDto
        >
    > {
        const bookWithSameName = await this.booksRepository.findByName(name);

        if (bookWithSameName) {
            return left(new BookAlreadyExistsError(name));
        }

        const validated = await this.authorsRepository.validateManyIds(
            authors.map((author) => author.id),
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

        const book = new Book({
            name,
            authors: authors.map(
                (author) => new BookAuthors(author.id, author.name),
            ),
            publisher: new BookPublisher(publisher.id, publisher.name),
            edition: new BookEdition(
                editionNumber,
                editionDescription,
                editionYear,
            ),
            quantity,
            available: quantity,
            pages,
        });

        await this.booksRepository.create(book);
        await this.bookAuthorsRepository.create(
            book.id.toString(),
            authors.map((author) => author.id),
        );

        return right({
            id: book.id.toString(),
            name: book.name,
            authors: book.authors.map((author) => ({
                id: author.id.toString(),
                name: author.name,
            })),
            publisher: {
                id: book.publisher.id.toString(),
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
