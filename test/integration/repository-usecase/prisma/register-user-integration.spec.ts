import { FakeHasher } from 'test/cryptography/fake-hasher';
import { UserAlreadyExistsError } from '@usecase/@errors/user-already-exists-error';
import { User } from '@domain/entities/user';
import { PrismaService } from '@infra/database/prisma/prisma.service';
import { RegisterUserUseCase } from '@usecase/register-user/register-user';
import {
    startEnvironment,
    stopEnvironment,
} from 'test/utils/test-environment-setup';
import { PrismaUsersRepository } from '@infra/database/prisma/repositories/prisma-users-repository';

const fakeHasher: FakeHasher = new FakeHasher();

let prisma: PrismaService;
let registerUserUseCase: RegisterUserUseCase;

describe('[IT] - Register user', () => {
    beforeEach(async () => {
        prisma = new PrismaService();
        startEnvironment();
    });

    afterEach(async () => {
        await stopEnvironment(prisma);
    });

    it('should be able to register a new user', async () => {
        const usersRepository = new PrismaUsersRepository(prisma);
        registerUserUseCase = new RegisterUserUseCase(
            usersRepository,
            fakeHasher,
        );

        const user = {
            name: 'Name 1',
            email: 'email@email.com',
            password: '123456',
        };

        const result = await registerUserUseCase.execute(user);

        expect(result.isRight()).toBe(true);
        expect(result.value).toEqual({
            id: expect.any(String),
            name: user.name,
            email: user.email,
            password: expect.any(String),
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
        });
    });

    it('should return a message error when user already exists', async () => {
        const usersRepository = new PrismaUsersRepository(prisma);

        registerUserUseCase = new RegisterUserUseCase(
            usersRepository,
            fakeHasher,
        );

        const user = new User({
            name: 'Name 1',
            email: 'email@email.com',
            password: '123456',
        });

        await usersRepository.create(user);

        const result = await registerUserUseCase.execute({
            name: 'Name 1',
            email: 'email@email.com',
            password: '123456',
        });

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(UserAlreadyExistsError);
    });
});
