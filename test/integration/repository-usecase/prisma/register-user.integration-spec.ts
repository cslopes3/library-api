import { FakeHasher } from 'test/cryptography/fake-hasher';
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
let usersRepository: PrismaUsersRepository;

describe('[IT] - Register user', () => {
    beforeEach(() => {
        prisma = new PrismaService();
        startEnvironment();

        usersRepository = new PrismaUsersRepository(prisma);
        registerUserUseCase = new RegisterUserUseCase(
            usersRepository,
            fakeHasher,
        );
    });

    afterEach(async () => {
        await stopEnvironment(prisma);
    });

    it('should be able to register a new user', async () => {
        const user = {
            name: 'Name 1',
            email: 'email@email.com',
            password: '123456',
        };

        const result = await registerUserUseCase.execute(user);

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toMatchObject({
            id: expect.any(String),
            name: user.name,
            email: user.email,
            password: expect.any(String),
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
        });
    });
});
