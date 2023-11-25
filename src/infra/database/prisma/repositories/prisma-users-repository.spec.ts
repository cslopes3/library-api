import {
    startEnvironment,
    stopEnvironment,
} from 'test/utils/test-environment-setup';
import { PrismaService } from '../prisma.service';
import { PrismaUsersRepository } from './prisma-users-repository';
import {
    PrismaFakeUser,
    createFakeUser,
} from 'test/factories/fake-user-factory';

let prisma: PrismaService;
let usersRepository: PrismaUsersRepository;
let prismaFakeUser: PrismaFakeUser;

describe('[UT] - Users repository', () => {
    beforeEach(() => {
        prisma = new PrismaService();
        startEnvironment();
        usersRepository = new PrismaUsersRepository(prisma);
        prismaFakeUser = new PrismaFakeUser(prisma);
    });

    afterEach(async () => {
        await stopEnvironment(prisma);
    });

    it('should register an user', async () => {
        const user = createFakeUser();

        vi.spyOn(prisma.user, 'create');

        await usersRepository.create(user);

        expect(prisma.user.create).toHaveBeenCalledWith({
            data: {
                id: user.id.toString(),
                name: user.name,
                email: user.email,
                password: expect.any(String),
                role: user.role.toString(),
            },
        });
    });

    it('should find user by email', async () => {
        const user = await prismaFakeUser.create();

        const result = await usersRepository.findByEmail(user.email);

        expect(result?.name).toEqual(user.name);
    });

    it('should return null when not found an user', async () => {
        const result = await usersRepository.findByEmail('email@email.com');

        expect(result).toBeNull();
    });

    it('should find user by id', async () => {
        const user = await prismaFakeUser.create();

        const result = await usersRepository.findById(user.id.toString());

        expect(result?.name).toEqual(user.name);
    });

    it('should return null when not found an user', async () => {
        const result = await usersRepository.findById('1');

        expect(result).toBeNull();
    });
});
