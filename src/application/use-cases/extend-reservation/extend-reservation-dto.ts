export interface ExtendReservationInputDto {
    id: string;
    currentUserId: string;
}

export interface ExtendReservationOutputDto {
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
