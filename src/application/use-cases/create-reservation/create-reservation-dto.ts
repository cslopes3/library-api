export interface CreateReservationInputDto {
    userId: string;
    reservationItems: {
        bookId: string;
        name: string;
    }[];
}

export interface CreateReservationOutputDto {
    id: string;
    userId: string;
    reservationItems: {
        id: string;
        bookId: string;
        name: string;
        expirationDate: Date;
        alreadyExtendTime: boolean;
        returned: boolean;
    }[];
    createdAt: Date;
    updatedAt: Date;
}
