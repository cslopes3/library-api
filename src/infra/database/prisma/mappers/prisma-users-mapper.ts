import { User } from '@domain/entities/user';
import { User as PrismaUser, Prisma } from '@prisma/client';

export class PrismaUserMapper {
    static toDomain(raw: PrismaUser): User {
        return new User(
            {
                name: raw.name,
                email: raw.email,
                password: raw.password,
            },
            raw.id,
        );
    }

    static toPrisma(user: User): Prisma.UserUncheckedCreateInput {
        return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            password: user.password,
        };
    }
}
