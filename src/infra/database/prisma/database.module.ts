import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaAuthorsRepository } from './repositories/prisma-authors-repository';
import { AuthorsRepository } from '@repository/authors-repository';
import { UsersRepository } from '@repository/users-repository';
import { PrismaUsersRepository } from './repositories/prisma-users-repository';

@Module({
    providers: [
        PrismaService,
        {
            provide: AuthorsRepository,
            useClass: PrismaAuthorsRepository,
        },
        {
            provide: UsersRepository,
            useClass: PrismaUsersRepository,
        },
    ],
    exports: [PrismaService, AuthorsRepository, UsersRepository],
})
export class DatabaseModule {}
