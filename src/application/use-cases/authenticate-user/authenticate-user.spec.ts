import { AuthenticateUserUseCase } from './authenticate-user';
import { FakeEncrypter } from 'test/cryptography/fake-encrypter';
import { FakeHasher } from 'test/cryptography/fake-hasher';
import { User } from '@domain/entities/user';
import { WrongCredentialsError } from '@usecase/@errors/wrong-credentials-error';

const MockRepository = () => {
    return {
        findById: vi.fn(),
        findByEmail: vi.fn(),
        create: vi.fn(),
    };
};

const fakeHasher: FakeHasher = new FakeHasher();
const encrypter: FakeEncrypter = new FakeEncrypter();

let authenticateUserUseCase: AuthenticateUserUseCase;

describe('[UT] - Authenticate User', () => {
    it('should authenticate a user', async () => {
        const usersRepository = MockRepository();

        const user = new User({
            name: 'John Doe',
            email: 'johndoe@example.com',
            password: await fakeHasher.hash('123456'),
        });

        usersRepository.findByEmail.mockReturnValue(Promise.resolve(user));

        authenticateUserUseCase = new AuthenticateUserUseCase(
            usersRepository,
            fakeHasher,
            encrypter,
        );

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
        const usersRepository = MockRepository();
        authenticateUserUseCase = new AuthenticateUserUseCase(
            usersRepository,
            fakeHasher,
            encrypter,
        );

        const result = await authenticateUserUseCase.execute({
            email: 'johndoe@example.com',
            password: '123456',
        });

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(WrongCredentialsError);
    });

    it('should return a message error when provide wrong password', async () => {
        const usersRepository = MockRepository();

        const user = new User({
            name: 'John Doe',
            email: 'johndoe@example.com',
            password: await fakeHasher.hash('123456'),
        });

        usersRepository.findByEmail.mockReturnValue(Promise.resolve(user));

        authenticateUserUseCase = new AuthenticateUserUseCase(
            usersRepository,
            fakeHasher,
            encrypter,
        );

        const result = await authenticateUserUseCase.execute({
            email: 'johndoe@example.com',
            password: '654321',
        });

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(WrongCredentialsError);
    });
});
