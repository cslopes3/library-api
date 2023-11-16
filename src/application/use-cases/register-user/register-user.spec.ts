import { FakeHasher } from 'test/cryptography/fake-hasher';
import { RegisterUserUseCase } from './register-user';
import { UserAlreadyExistsError } from '@usecase/@errors/user-already-exists-error';
import { UsersMockRepository } from '@mocks/mock-users-repository';
import { FakeUserFactory } from 'test/factories/fake-user-factory';

let usersRepository: ReturnType<typeof UsersMockRepository>;
let fakeHasher: FakeHasher;

let registerUserUseCase: RegisterUserUseCase;

describe('[UT] - Register user', () => {
    beforeEach(() => {
        usersRepository = UsersMockRepository();
        fakeHasher = new FakeHasher();
    });

    it('should be able to register a new user', async () => {
        const user = FakeUserFactory.create();

        registerUserUseCase = new RegisterUserUseCase(
            usersRepository,
            fakeHasher,
        );

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

    it('should return a message error when user already exists', async () => {
        const user = FakeUserFactory.create();

        usersRepository.findByEmail.mockResolvedValue(user);

        registerUserUseCase = new RegisterUserUseCase(
            usersRepository,
            fakeHasher,
        );

        const result = await registerUserUseCase.execute({
            name: user.name,
            email: user.email,
            password: user.password,
        });

        expect(result.isLeft()).toBeTruthy();
        expect(result.value).toBeInstanceOf(UserAlreadyExistsError);
    });

    it('should hash user password upon registration', async () => {
        const user = FakeUserFactory.create();

        registerUserUseCase = new RegisterUserUseCase(
            usersRepository,
            fakeHasher,
        );

        const result = await registerUserUseCase.execute({
            name: user.name,
            email: user.email,
            password: user.password,
        });

        const hashedPassword = await fakeHasher.hash(user.password);

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toEqual(
            expect.objectContaining({
                password: hashedPassword,
            }),
        );
    });
});
