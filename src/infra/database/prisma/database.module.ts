import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaAuthorsRepository } from './repositories/prisma-authors-repository';
import { AuthorsRepository } from '@repository/authors-repository';
import { UsersRepository } from '@repository/users-repository';
import { PrismaUsersRepository } from './repositories/prisma-users-repository';
import { PublishersRepository } from '@repository/publishers-repository';
import { PrismaPublishersRepository } from './repositories/prisma-publishers-repository';
import { BooksRepository } from '@repository/books-repository';
import { PrismaBooksRepository } from './repositories/prisma-books-repository';
import { BookAuthorsRepository } from '@repository/book-authors-repository';
import { PrismaBookAuthorsRepository } from './repositories/prisma-book-authors-repository';
import { ReservationsRepository } from '@repository/reservations-repository';
import { PrismaReservationsRepository } from './repositories/prisma-reservations-repository';
import { SchedulesRepository } from '@repository/schedules-repository';
import { PrismaSchedulesRepository } from './repositories/prisma-schedule-repository';

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
        {
            provide: PublishersRepository,
            useClass: PrismaPublishersRepository,
        },
        {
            provide: BooksRepository,
            useClass: PrismaBooksRepository,
        },
        {
            provide: BookAuthorsRepository,
            useClass: PrismaBookAuthorsRepository,
        },
        {
            provide: ReservationsRepository,
            useClass: PrismaReservationsRepository,
        },
        {
            provide: SchedulesRepository,
            useClass: PrismaSchedulesRepository,
        },
    ],
    exports: [
        PrismaService,
        AuthorsRepository,
        UsersRepository,
        PublishersRepository,
        BooksRepository,
        BookAuthorsRepository,
        ReservationsRepository,
        SchedulesRepository,
    ],
})
export class DatabaseModule {}
