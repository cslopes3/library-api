import { FakeEncrypter } from 'test/cryptography/fake-encrypter';
import { FakeHasher } from 'test/cryptography/fake-hasher';
import { User } from '@domain/entities/user';
import { WrongCredentialsError } from '@usecase/@errors/wrong-credentials-error';
import { AuthenticateUserUseCase } from '@usecase/authenticate-user/authenticate-user';
import { PrismaService } from '@infra/database/prisma/prisma.service';
import {
    startEnvironment,
    stopEnvironment,
} from 'test/utils/test-environment-setup';
import { PrismaUsersRepository } from '@infra/database/prisma/repositories/prisma-users-repository';

const fakeHasher: FakeHasher = new FakeHasher();
const encrypter: FakeEncrypter = new FakeEncrypter();

let authenticateUserUseCase: AuthenticateUserUseCase;
let prisma: PrismaService;
let usersRepository: PrismaUsersRepository;

describe('[IT] - Authenticate User', () => {
    beforeEach(async () => {
        prisma = new PrismaService();
        startEnvironment();

        usersRepository = new PrismaUsersRepository(prisma);
        authenticateUserUseCase = new AuthenticateUserUseCase(
            usersRepository,
            fakeHasher,
            encrypter,
        );
    });

    afterEach(async () => {
        await stopEnvironment(prisma);
    });

    it('should authenticate a user', async () => {
        const user = new User({
            name: 'John Doe',
            email: 'johndoe@example.com',
            password: await fakeHasher.hash('123456'),
        });

        await usersRepository.create(user);

        const result = await authenticateUserUseCase.execute({
            email: 'johndoe@example.com',
            password: '123456',
        });

        expect(result.isRight()).toBe(true);
        expect(result.value).toEqual({
            accessToken: expect.any(String),
        });
    });

    it('should return a message error when provide wrong email', async () => {
        const result = await authenticateUserUseCase.execute({
            email: 'johndoe@example.com',
            password: '123456',
        });

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(WrongCredentialsError);
    });

    it('should return a message error when provide wrong password', async () => {
        const user = new User({
            name: 'John Doe',
            email: 'johndoe@example.com',
            password: await fakeHasher.hash('123456'),
        });

        await usersRepository.create(user);

        const result = await authenticateUserUseCase.execute({
            email: 'johndoe@example.com',
            password: '654321',
        });

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(WrongCredentialsError);
    });
});
