import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UsersRepository } from '@repository/users-repository';
import { User } from '@domain/entities/user';
import { PrismaUserMapper } from '@infra/database/prisma/mappers/prisma-users-mapper';

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
    constructor(private prisma: PrismaService) {}
    findById(id: string): Promise<User | null> {
        throw new Error('Method not implemented.');
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

        return PrismaUserMapper.toDomain(user);
    }

    async create(user: User): Promise<void> {
        const data = PrismaUserMapper.toPrisma(user);

        await this.prisma.user.create({
            data,
        });
    }
}
