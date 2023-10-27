export interface UpdateAuthorInputDto {
    id: string;
    name: string;
}

export interface UpdateAuthorOutputDto {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}
