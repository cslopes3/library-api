import { Book } from '@domain/entities/book';
import { BookAuthors } from '@domain/value-objects/book-authors';
import { BookEdition } from '@domain/value-objects/book-edition';
import { BookPublisher } from '@domain/value-objects/book-publisher';
import {
    Book as PrismaBook,
    BookAuthors as PrismaBookAuthors,
    Publisher as PrismaPublisher,
    Prisma,
} from '@prisma/client';

type PrismaBookWithAuthorAndPublisher = PrismaBook & {
    authors: PrismaBookAuthors[];
    publisher: PrismaPublisher;
};

export class PrismaBookMapper {
    static toDomainLayer(raw: PrismaBookWithAuthorAndPublisher): Book {
        return new Book(
            {
                name: raw.name,
                authors: raw.authors.map(
                    (author) =>
                        new BookAuthors(author.authorId, author['author'].name),
                ),
                publisher: new BookPublisher(
                    raw.publisher.name,
                    raw.publisher.id,
                ),
                edition: new BookEdition(
                    raw.editionNumber,
                    raw.editionDescription,
                    raw.editionYear,
                ),
                quantity: raw.quantity,
                available: raw.available,
                pages: raw.pages,
            },
            raw.id,
            raw.createdAt,
            raw.updatedAt ?? undefined,
        );
    }

    static toPersistent(book: Book): Prisma.BookUncheckedCreateInput {
        return {
            id: book.id.toString(),
            name: book.name,
            editionNumber: book.edition.number,
            editionDescription: book.edition.description,
            editionYear: book.edition.year,
            quantity: book.quantity,
            available: book.available,
            pages: book.pages,
            publisherId: book.publisher.id,
        };
    }

    static toPersistentWithoutAmount(
        book: Book,
    ): Prisma.BookUncheckedUpdateInput {
        return {
            id: book.id.toString(),
            name: book.name,
            editionNumber: book.edition.number,
            editionDescription: book.edition.description,
            editionYear: book.edition.year,
            pages: book.pages,
            publisherId: book.publisher.id,
        };
    }
}
