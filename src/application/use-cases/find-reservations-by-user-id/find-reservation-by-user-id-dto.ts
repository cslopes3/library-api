export interface FindReservationByUserIdInputDto {
    userId: string;
}

export interface FindReservationByUserIdOutputDto {
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
