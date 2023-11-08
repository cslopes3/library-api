export interface FindLastThirtyDaysScheduleByUserIdInputDto {
    userId: string;
}

export interface FindLastThirtyDaysScheduleByUserIdOutputDto {
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
