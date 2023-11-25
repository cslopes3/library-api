import { User } from '@domain/entities/user';
import { User as PrismaUser, Prisma } from '@prisma/client';
import { UserRole } from '@shared/utils/user-role';

export class PrismaUserMapper {
    static toDomainLayer(raw: PrismaUser): User {
        return new User(
            {
                name: raw.name,
                email: raw.email,
                password: raw.password,
                role: raw.role as UserRole,
            },
            raw.id,
        );
    }

    static toPersistent(user: User): Prisma.UserUncheckedCreateInput {
        return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            password: user.password,
            role: user.role,
        };
    }
}
