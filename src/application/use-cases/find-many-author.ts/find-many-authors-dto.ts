import { PaginationParams } from '@shared/repositories/pagination-params';

export interface FindManyAuthorsInputDto {
    params: PaginationParams;
}

export interface FindManyAuthorsOutputDto {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}
