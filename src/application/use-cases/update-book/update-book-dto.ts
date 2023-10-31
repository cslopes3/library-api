export interface UpdateBookInputDto {
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
    pages: number;
}

export interface UpdateBookOutputDto {
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
