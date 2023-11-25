import { Injectable } from '@nestjs/common';
import { User } from '@domain/entities/user';
import { UsersRepository } from '@repository/users-repository';
import { HashGenerator } from '@cryptography/hash-generator';
import { UserAlreadyExistsError } from '@usecase/@errors/user-already-exists-error';
import {
    RegisterUserInputDto,
    RegisterUserOutputDto,
} from './register-user-dto';
import { Either, left, right } from '@shared/errors/either';
import { UserRole } from '@shared/utils/user-role';

@Injectable()
export class RegisterUserUseCase {
    constructor(
        private usersRepository: UsersRepository,
        private hashGenerator: HashGenerator,
    ) {}

    async execute({
        name,
        email,
        password,
        role,
    }: RegisterUserInputDto): Promise<
        Either<UserAlreadyExistsError, RegisterUserOutputDto>
    > {
        const userWithSameEmail = await this.usersRepository.findByEmail(email);

        if (userWithSameEmail) {
            return left(new UserAlreadyExistsError(email));
        }

        const hashedPassword = await this.hashGenerator.hash(password);

        const user = new User({
            name,
            email,
            password: hashedPassword,
            role: (role ?? 'user') as UserRole,
        });

        await this.usersRepository.create(user);

        return right({
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            password: user.password,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        });
    }
}
