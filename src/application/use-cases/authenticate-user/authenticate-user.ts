import { Injectable } from '@nestjs/common';
import { UsersRepository } from '@repository/users-repository';
import { HashComparer } from '@cryptography/hash-comparer';
import { Encrypter } from '@cryptography/encrypter';
import { WrongCredentialsError } from '@usecase/@errors/wrong-credentials-error';
import {
    AuthenticateUserInputDto,
    AuthenticateUserOutputDto,
} from './authenticate-user-dto';
import { Either, left, right } from '@shared/errors/either';

@Injectable()
export class AuthenticateUserUseCase {
    constructor(
        private usersRepository: UsersRepository,
        private hashComparer: HashComparer,
        private encrypter: Encrypter,
    ) {}

    async execute({
        email,
        password,
    }: AuthenticateUserInputDto): Promise<
        Either<WrongCredentialsError, AuthenticateUserOutputDto>
    > {
        const user = await this.usersRepository.findByEmail(email);

        if (!user) {
            return left(new WrongCredentialsError());
        }

        const isPasswordValid = await this.hashComparer.compare(
            password,
            user.password,
        );

        if (!isPasswordValid) {
            return left(new WrongCredentialsError());
        }

        const accessToken = await this.encrypter.encrypt({
            sub: user.id.toString(),
            role: user.role,
        });

        return right({ accessToken });
    }
}
