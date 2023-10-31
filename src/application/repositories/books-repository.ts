import { Book } from '@domain/entities/book';
import { PaginationParams } from '@shared/repositories/pagination-params';

export abstract class BooksRepository {
    abstract create(book: Book): Promise<void>;
    abstract update(book: Book): Promise<void>;
    abstract delete(id: string): Promise<void>;
    abstract findById(id: string): Promise<Book | null>;
    abstract findByName(name: string): Promise<Book | null>;
    abstract findMany(params: PaginationParams): Promise<Book[] | []>;
}
