import { PaginationParams } from '@shared/repositories/pagination-params';

export interface FindManyBooksInputDto {
    params: PaginationParams;
}

export interface FindManyBooksOutputDto {
    id: string;
    name: string;
    authors: {
        id: string;
        name: string;
    }[];
    publisher: {
        id: string;
        name: string;
    };
    editionNumber: number;
    editionDescription: string;
    editionYear: number;
    quantity: number;
    available: number;
    pages: number;
    createdAt: Date;
    updatedAt: Date;
}
