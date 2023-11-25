export interface FindReservationScheduleByIdInputDto {
    id: string;
    currentUserId: string;
}

export interface FindReservationScheduleByIdOutputDto {
    id: string;
    date: Date;
    userId: string;
    scheduleItems: {
        id: string;
        bookId: string;
        name: string;
    }[];
    status: string;
    createdAt: Date;
    updatedAt: Date;
}
