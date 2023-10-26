import { FakeHasher } from 'test/cryptography/fake-hasher';
import { RegisterUserUseCase } from './register-user';
import { UserAlreadyExistsError } from '@usecase/@errors/user-already-exists-error';
import { User } from '@domain/entities/user';

const MockRepository = () => {
    return {
        findByEmail: vi.fn(),
        create: vi.fn(),
    };
};

const fakeHasher: FakeHasher = new FakeHasher();

let registerUserUseCase: RegisterUserUseCase;

describe('[UT] - Register user', () => {
    it('should be able to register a new user', async () => {
        const usersRepository = MockRepository();
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
        const user = new User({
            name: 'Name 1',
            email: 'email@email.com',
            password: '123456',
        });

        const usersRepository = MockRepository();
        usersRepository.findByEmail.mockReturnValue(Promise.resolve(user));

        registerUserUseCase = new RegisterUserUseCase(
            usersRepository,
            fakeHasher,
        );

        const result = await registerUserUseCase.execute({
            name: 'Name 1',
            email: 'email@email.com',
            password: '123456',
        });

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(UserAlreadyExistsError);
    });

    it('should hash user password upon registration', async () => {
        const usersRepository = MockRepository();
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

        const hashedPassword = await fakeHasher.hash('123456');

        expect(result.isRight()).toBe(true);
        expect(result.value).toEqual(
            expect.objectContaining({
                password: hashedPassword,
            }),
        );
    });
});
