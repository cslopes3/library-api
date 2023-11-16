import { FakeEncrypter } from 'test/cryptography/fake-encrypter';
import { FakeHasher } from 'test/cryptography/fake-hasher';
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
    beforeEach(() => {
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
        await prisma.user.create({
            data: {
                name: 'John Doe',
                email: 'johndoe@example.com',
                password: await fakeHasher.hash('123456'),
            },
        });

        const result = await authenticateUserUseCase.execute({
            email: 'johndoe@example.com',
            password: '123456',
        });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toEqual({
            accessToken: expect.any(String),
        });
    });
});
