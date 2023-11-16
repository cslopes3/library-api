import { Book } from '@domain/entities/book';
import { BookAuthors } from '@domain/value-objects/book-authors';
import { BookEdition } from '@domain/value-objects/book-edition';
import { BookPublisher } from '@domain/value-objects/book-publisher';

export class FakeBookFactory {
    static create(options?: Partial<Book>, id?: string): Book {
        const bookDefaultValues = {
            name: 'Book 1',
            authors: [new BookAuthors('1', 'Author 1')],
            publisher: new BookPublisher('1', 'Publisher 1'),
            edition: new BookEdition(3, 'Book 1 description', 2023),
            quantity: 10,
            available: 10,
            pages: 200,
        };

        return new Book({ ...bookDefaultValues, ...options }, id ?? '1');
    }
}
