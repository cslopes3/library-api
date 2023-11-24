import { BooksRepository } from '@repository/books-repository';
import {
    FindManyBooksInputDto,
    FindManyBooksOutputDto,
} from './find-many-books-dto';
import { Either, right } from '@shared/errors/either';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FindManyBooksUseCase {
    constructor(private booksRepository: BooksRepository) {}

    async execute({
        params,
    }: FindManyBooksInputDto): Promise<
        Either<null, FindManyBooksOutputDto[] | []>
    > {
        const books = await this.booksRepository.findMany({
            page: params.page,
        });

        return right(
            books.map((book) => ({
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
            })),
        );
    }
}
