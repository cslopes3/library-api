export interface FindAuthorByIdInputDto {
    id: string;
}

export interface FindAuthorByIdOutputDto {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}
