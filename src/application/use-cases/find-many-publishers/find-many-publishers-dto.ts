import { PaginationParams } from '@shared/repositories/pagination-params';

export interface FindManyPublishersInputDto {
    params: PaginationParams;
}

export interface FindManyPublishersOutputDto {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}
