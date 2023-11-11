import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UsersRepository } from '@repository/users-repository';
import { User } from '@domain/entities/user';
import { PrismaUserMapper } from '@infra/database/prisma/mappers/prisma-user-mapper';

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
    constructor(private prisma: PrismaService) {}
    async findById(id: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: {
                id,
            },
        });

        if (!user) {
            return null;
        }

        return PrismaUserMapper.toDomainLayer(user);
    }

    async findByEmail(email: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (!user) {
            return null;
        }

        return PrismaUserMapper.toDomainLayer(user);
    }

    async create(user: User): Promise<void> {
        const data = PrismaUserMapper.toPersistent(user);

        await this.prisma.user.create({
            data,
        });
    }
}
