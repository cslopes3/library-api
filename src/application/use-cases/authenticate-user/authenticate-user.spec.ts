import { AuthenticateUserUseCase } from './authenticate-user';
import { FakeEncrypter } from 'test/cryptography/fake-encrypter';
import { FakeHasher } from 'test/cryptography/fake-hasher';
import { WrongCredentialsError } from '@usecase/@errors/wrong-credentials-error';
import { UsersMockRepository } from '@mocks/mock-users-repository';
import { createFakeUser } from 'test/factories/fake-user-factory';

let usersRepository: ReturnType<typeof UsersMockRepository>;

let fakeHasher: FakeHasher;
let encrypter: FakeEncrypter;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe('[UT] - Authenticate User', () => {
    beforeEach(() => {
        usersRepository = UsersMockRepository();
        fakeHasher = new FakeHasher();
        encrypter = new FakeEncrypter();
    });

    it('should authenticate a user', async () => {
        const user = createFakeUser();
        const hashedPassord = await fakeHasher.hash(user.password);
        const userWithHashedPassword = createFakeUser({
            password: hashedPassord,
        });

        usersRepository.findByEmail.mockResolvedValue(userWithHashedPassword);

        authenticateUserUseCase = new AuthenticateUserUseCase(
            usersRepository,
            fakeHasher,
            encrypter,
        );

        const result = await authenticateUserUseCase.execute({
            email: user.email,
            password: user.password,
        });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toEqual({
            accessToken: expect.any(String),
        });
    });

    it('should return a message error when provide wrong email', async () => {
        authenticateUserUseCase = new AuthenticateUserUseCase(
            usersRepository,
            fakeHasher,
            encrypter,
        );

        const result = await authenticateUserUseCase.execute({
            email: 'email@example.com',
            password: '123456',
        });

        expect(result.isLeft()).toBeTruthy();
        expect(result.value).toBeInstanceOf(WrongCredentialsError);
    });

    it('should return a message error when provide wrong password', async () => {
        const user = createFakeUser();
        const userWrongPassword = createFakeUser({ password: 'xxxx' });

        usersRepository.findByEmail.mockResolvedValue(user);

        authenticateUserUseCase = new AuthenticateUserUseCase(
            usersRepository,
            fakeHasher,
            encrypter,
        );

        const result = await authenticateUserUseCase.execute({
            email: userWrongPassword.email,
            password: userWrongPassword.password,
        });

        expect(result.isLeft()).toBeTruthy();
        expect(result.value).toBeInstanceOf(WrongCredentialsError);
    });
});
