export interface CreateReservationScheduleInputDto {
    date: Date;
    userId: string;
    scheduleItems: {
        bookId: string;
        name: string;
    }[];
}

export interface CreateReservationScheduleOutputDto {
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
