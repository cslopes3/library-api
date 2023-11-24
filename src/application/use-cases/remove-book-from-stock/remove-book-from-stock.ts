import { BooksRepository } from '@repository/books-repository';
import {
    RemoveBookFromStockInputDto,
    RemoveBookFromStockOutputDto,
} from './remove-book-from-stock-dto';
import { Either, left, right } from '@shared/errors/either';
import { ResourceNotFoundError } from '@usecase/@errors/resource-not-found-error';
import { CantRemoveFromStockError } from '@usecase/@errors/cant-remove-from-stock-error';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RemoveBookFromStockUseCase {
    constructor(private booksRespository: BooksRepository) {}

    async execute({
        id,
        amount,
    }: RemoveBookFromStockInputDto): Promise<
        Either<
            ResourceNotFoundError | CantRemoveFromStockError,
            RemoveBookFromStockOutputDto
        >
    > {
        const book = await this.booksRespository.findById(id);

        if (!book) {
            return left(new ResourceNotFoundError());
        }

        if (book.quantity < amount || book.available < amount) {
            return left(new CantRemoveFromStockError());
        }

        await this.booksRespository.removeBookFromStock(id, amount, true);

        book.removeBookFromStock(amount);

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
