export interface ReturnAllItemsFromReservationInputDto {
    id: string;
}

export interface ReturnAllItemsFromReservationOutputDto {
    id: string;
    userId: string;
    reservationItems: {
        id: string;
        bookId: string;
        name: string;
        expirationDate: Date;
        alreadyExtendTime: boolean;
        returned: boolean;
        returnDate: Date;
    }[];
    createdAt: Date;
    updatedAt: Date;
}
