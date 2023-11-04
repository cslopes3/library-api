export interface ReturnByItemIdInputDto {
    id: string;
}

export interface ReturnByItemIdOutputDto {
    id: string;
    bookId: string;
    name: string;
    expirationDate: Date;
    alreadyExtendTime: boolean;
    returned: boolean;
    returnDate: Date;
}
