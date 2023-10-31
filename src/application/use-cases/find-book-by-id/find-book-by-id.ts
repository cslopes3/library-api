import { BooksRepository } from '@repository/books-repository';
import {
    FindBookByIdInputDto,
    FindBookByIdOutputDto,
} from './find-book-by-id-dto';
import { Either, right } from '@shared/errors/either';

export class FindBookByIdUseCase {
    constructor(private booksRepository: BooksRepository) {}

    async execute({
        id,
    }: FindBookByIdInputDto): Promise<
        Either<null, FindBookByIdOutputDto | null>
    > {
        const book = await this.booksRepository.findById(id);

        if (!book) {
            return right(null);
        }

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
