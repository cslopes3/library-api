import { Publisher } from '@domain/entities/publisher';
import { PaginationParams } from '@shared/repositories/pagination-params';

export abstract class PublishersRepository {
    abstract findById(id: string): Promise<Publisher | null>;
    abstract findByName(name: string): Promise<Publisher | null>;
    abstract findMany(params: PaginationParams): Promise<Publisher[] | []>;
    abstract create(publisher: Publisher): Promise<void>;
    abstract update(publisher: Publisher): Promise<void>;
    abstract delete(id: string): Promise<void>;
}
