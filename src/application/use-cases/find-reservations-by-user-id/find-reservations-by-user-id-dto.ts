export interface FindReservationsByUserIdInputDto {
    userId: string;
    currentUserId: string;
}

export interface FindReservationsByUserIdOutputDto {
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
