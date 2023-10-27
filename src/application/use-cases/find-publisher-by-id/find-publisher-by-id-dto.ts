export interface FindPublisherByIdInputDto {
    id: string;
}

export interface FindPublisherByIdOutputDto {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}
