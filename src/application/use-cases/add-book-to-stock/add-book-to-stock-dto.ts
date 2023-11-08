export interface AddBookToStockInputDto {
    id: string;
    amount: number;
}

export interface AddBookToStockOutputDto {
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
