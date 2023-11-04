export interface FindReservationByIdInputDto {
    id: string;
}

export interface FindReservationByIdOutputDto {
    id: string;
    userId: string;
    reservationItems: {
        id: string;
        bookId: string;
        name: string;
        expirationDate: Date;
        alreadyExtendTime: boolean;
        returned: boolean;
        returnDate: Date | undefined;
    }[];
    createdAt: Date;
    updatedAt: Date;
}
