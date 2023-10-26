import { Author } from '@domain/entities/author';
import { PaginationParams } from '@shared/repositories/pagination-params';

export abstract class AuthorsRepository {
    abstract findById(id: string): Promise<Author | null>;
    abstract findMany(params: PaginationParams): Promise<Author[] | []>;
    abstract create(author: Author): Promise<void>;
    abstract update(author: Author): Promise<void>;
    abstract delete(id: string): Promise<void>;
}
