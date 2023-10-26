export interface CreateAuthorInputDto {
    name;
}

export interface CreateAuthorOutputDto {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}
