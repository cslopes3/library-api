import {
    startEnvironment,
    stopEnvironment,
} from 'test/utils/test-environment-setup';
import { PrismaService } from '../prisma.service';
import { PrismaUsersRepository } from './prisma-users-repository';
import { User } from '@domain/entities/user';

let prisma: PrismaService;
let usersRepository: PrismaUsersRepository;

describe('[UT] - Users repository', () => {
    beforeEach(async () => {
        prisma = new PrismaService();
        startEnvironment();
        usersRepository = new PrismaUsersRepository(prisma);
    });

    afterEach(async () => {
        await stopEnvironment(prisma);
    });

    it('should register an user', async () => {
        vi.spyOn(prisma.user, 'create');

        const user = new User({
            name: 'Name 1',
            email: 'email@email.com',
            password: '123456',
        });

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
                name: 'Name 1',
                email: 'email@email.com',
                password: '123456',
            },
        });

        const result = await usersRepository.findByEmail('email@email.com');

        expect(result?.name).toEqual('Name 1');
    });

    it('should return null when not found an user', async () => {
        const result = await usersRepository.findByEmail('email@email.com');

        expect(result).toBeNull();
    });
});
