export interface CreatePublisherInputDto {
    name;
}

export interface CreatePublisherOutputDto {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}
