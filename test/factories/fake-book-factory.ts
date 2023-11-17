import { Book } from '@domain/entities/book';
import { BookAuthors } from '@domain/value-objects/book-authors';
import { BookEdition } from '@domain/value-objects/book-edition';
import { BookPublisher } from '@domain/value-objects/book-publisher';
import { PrismaBookMapper } from '@infra/database/prisma/mappers/prisma-book-mapper';
import { PrismaService } from '@infra/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

export function createFakeBook(options?: Partial<Book>): Book {
    const bookDefaultValues = {
        name: 'Book 1',
        authors: [new BookAuthors('1', 'Author 1')],
        publisher: new BookPublisher('1', 'Publisher 1'),
        edition: new BookEdition(3, 'Book 1 description', 2023),
        quantity: 10,
        available: 10,
        pages: 200,
    };

    return new Book({ ...bookDefaultValues, ...options });
}

@Injectable()
export class PrismaFakeBook {
    constructor(private prisma: PrismaService) {}

    async create(options?: Partial<Book>): Promise<Book> {
        const book = createFakeBook(options);

        await this.prisma.book.create({
            data: PrismaBookMapper.toPersistent(book),
        });

        return book;
    }
}
