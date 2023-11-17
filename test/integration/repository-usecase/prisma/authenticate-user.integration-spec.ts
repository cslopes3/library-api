import { FakeEncrypter } from 'test/cryptography/fake-encrypter';
import { FakeHasher } from 'test/cryptography/fake-hasher';
import { AuthenticateUserUseCase } from '@usecase/authenticate-user/authenticate-user';
import { PrismaService } from '@infra/database/prisma/prisma.service';
import {
    startEnvironment,
    stopEnvironment,
} from 'test/utils/test-environment-setup';
import { PrismaUsersRepository } from '@infra/database/prisma/repositories/prisma-users-repository';
import { PrismaFakeUser } from 'test/factories/fake-user-factory';

const fakeHasher: FakeHasher = new FakeHasher();
const encrypter: FakeEncrypter = new FakeEncrypter();

let authenticateUserUseCase: AuthenticateUserUseCase;
let prisma: PrismaService;
let usersRepository: PrismaUsersRepository;
let prismaFakeUser: PrismaFakeUser;

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

        prismaFakeUser = new PrismaFakeUser(prisma);
    });

    afterEach(async () => {
        await stopEnvironment(prisma);
    });

    it('should authenticate a user', async () => {
        const password = '123456';
        const user = await prismaFakeUser.create({
            password: await fakeHasher.hash(password),
        });

        const result = await authenticateUserUseCase.execute({
            email: user.email,
            password: password,
        });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toEqual({
            accessToken: expect.any(String),
        });
    });
});
