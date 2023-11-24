import { BooksRepository } from '@repository/books-repository';
import { DeleteBookInputDto } from './delete-book-dto';
import { ResourceNotFoundError } from '@usecase/@errors/resource-not-found-error';
import { Either, left, right } from '@shared/errors/either';
import { BookAuthorsRepository } from '@repository/book-authors-repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DeleteBookUseCase {
    constructor(
        private booksRepository: BooksRepository,
        private bookAuthorsRepository: BookAuthorsRepository,
    ) {}

    async execute({
        id,
    }: DeleteBookInputDto): Promise<Either<ResourceNotFoundError, null>> {
        const book = await this.booksRepository.findById(id);

        if (!book) {
            return left(new ResourceNotFoundError());
        }

        await this.bookAuthorsRepository.delete(id);
        await this.booksRepository.delete(id);

        return right(null);
    }
}
