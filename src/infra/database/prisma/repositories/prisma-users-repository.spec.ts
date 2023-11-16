import {
    startEnvironment,
    stopEnvironment,
} from 'test/utils/test-environment-setup';
import { PrismaService } from '../prisma.service';
import { PrismaUsersRepository } from './prisma-users-repository';
import { FakeUserFactory } from 'test/factories/fake-user-factory';

let prisma: PrismaService;
let usersRepository: PrismaUsersRepository;

describe('[UT] - Users repository', () => {
    beforeEach(() => {
        prisma = new PrismaService();
        startEnvironment();
        usersRepository = new PrismaUsersRepository(prisma);
    });

    afterEach(async () => {
        await stopEnvironment(prisma);
    });

    it('should register an user', async () => {
        vi.spyOn(prisma.user, 'create');

        const user = FakeUserFactory.create();

        await usersRepository.create(user);

        expect(prisma.user.create).toHaveBeenCalledWith({
            data: {
                id: user.id.toString(),
                name: user.name,
                email: user.email,
                password: expect.any(String),
            },
        });
    });

    it('should find user by email', async () => {
        await prisma.user.create({
            data: {
                name: 'User 1',
                email: 'email@email.com',
                password: '123456',
            },
        });

        const result = await usersRepository.findByEmail('email@email.com');

        expect(result?.name).toEqual('User 1');
    });

    it('should return null when not found an user', async () => {
        const result = await usersRepository.findByEmail('email@email.com');

        expect(result).toBeNull();
    });

    it('should find user by id', async () => {
        await prisma.user.create({
            data: {
                id: '1',
                name: 'User 1',
                email: 'email@email.com',
                password: '123456',
            },
        });

        const result = await usersRepository.findById('1');

        expect(result?.name).toEqual('User 1');
    });

    it('should return null when not found an user', async () => {
        const result = await usersRepository.findById('1');

        expect(result).toBeNull();
    });
});
