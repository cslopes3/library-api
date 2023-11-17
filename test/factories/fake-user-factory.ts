import { User } from '@domain/entities/user';
import { PrismaUserMapper } from '@infra/database/prisma/mappers/prisma-user-mapper';
import { PrismaService } from '@infra/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

export function createFakeUser(options?: Partial<User>): User {
    const userDefaultValues = {
        name: 'User 1',
        email: 'user1@example.com',
        password: '123456',
    };

    return new User({ ...userDefaultValues, ...options });
}

@Injectable()
export class PrismaFakeUser {
    constructor(private prisma: PrismaService) {}

    async create(options?: Partial<User>): Promise<User> {
        const user = createFakeUser(options);

        await this.prisma.user.create({
            data: PrismaUserMapper.toPersistent(user),
        });

        return user;
    }
}
