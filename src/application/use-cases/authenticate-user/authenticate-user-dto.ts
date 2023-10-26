export interface AuthenticateUserInputDto {
    email: string;
    password: string;
}

export interface AuthenticateUserOutputDto {
    accessToken: string;
}
