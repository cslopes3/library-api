export interface UpdatePublisherInputDto {
    id: string;
    name: string;
}

export interface UpdatePublisherOutputDto {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}
