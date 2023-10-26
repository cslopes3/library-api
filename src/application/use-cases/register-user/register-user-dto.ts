export interface RegisterUserInputDto {
    name: string;
    email: string;
    password: string;
}

export interface RegisterUserOutputDto {
    id: string;
    name: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}
