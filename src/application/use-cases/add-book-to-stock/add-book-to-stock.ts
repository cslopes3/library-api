import { BooksRepository } from '@repository/books-repository';
import {
    AddBookToStockInputDto,
    AddBookToStockOutputDto,
} from './add-book-to-stock-dto';
import { Either, left, right } from '@shared/errors/either';
import { ResourceNotFoundError } from '@usecase/@errors/resource-not-found-error';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AddBookToStockUseCase {
    constructor(private booksRepository: BooksRepository) {}

    async execute({
        id,
        amount,
    }: AddBookToStockInputDto): Promise<
        Either<ResourceNotFoundError, AddBookToStockOutputDto>
    > {
        const book = await this.booksRepository.findById(id);

        if (!book) {
            return left(new ResourceNotFoundError());
        }

        await this.booksRepository.addBookToStock(id, amount, true);

        book.addBookToStock(amount);

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
