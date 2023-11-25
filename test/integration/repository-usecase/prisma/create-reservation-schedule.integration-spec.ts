import { BookPublisher } from '@domain/value-objects/book-publisher';
import { PrismaService } from '@infra/database/prisma/prisma.service';
import { PrismaBooksRepository } from '@infra/database/prisma/repositories/prisma-books-repository';
import { PrismaReservationsRepository } from '@infra/database/prisma/repositories/prisma-reservations-repository';
import { PrismaSchedulesRepository } from '@infra/database/prisma/repositories/prisma-schedule-repository';
import { PrismaUsersRepository } from '@infra/database/prisma/repositories/prisma-users-repository';
import { CreateReservationScheduleUseCase } from '@usecase/create-reservation-schedule/create-reservation-schedule';
import { PrismaFakeBook } from 'test/factories/fake-book-factory';
import { PrismaFakePublisher } from 'test/factories/fake-publisher-factory';
import { PrismaFakeUser } from 'test/factories/fake-user-factory';
import {
    startEnvironment,
    stopEnvironment,
} from 'test/utils/test-environment-setup';

let prisma: PrismaService;
let schedulesRepository: PrismaSchedulesRepository;
let reservationsRepository: PrismaReservationsRepository;
let booksRepository: PrismaBooksRepository;
let usersRepository: PrismaUsersRepository;
let createReservationScheduleUseCase: CreateReservationScheduleUseCase;
let prismaFakeUser: PrismaFakeUser;
let prismaFakePublisher: PrismaFakePublisher;
let prismaFakeBook: PrismaFakeBook;

describe('[IT] - Create reservation schedule', () => {
    beforeEach(() => {
        prisma = new PrismaService();
        startEnvironment();
        schedulesRepository = new PrismaSchedulesRepository(prisma);
        reservationsRepository = new PrismaReservationsRepository(prisma);
        booksRepository = new PrismaBooksRepository(prisma);
        usersRepository = new PrismaUsersRepository(prisma);
        createReservationScheduleUseCase = new CreateReservationScheduleUseCase(
            schedulesRepository,
            reservationsRepository,
            booksRepository,
            usersRepository,
        );

        prismaFakeUser = new PrismaFakeUser(prisma);
        prismaFakePublisher = new PrismaFakePublisher(prisma);
        prismaFakeBook = new PrismaFakeBook(prisma);
    });

    afterEach(async () => {
        await stopEnvironment(prisma);
    });

    it('should schedule a reservation', async () => {
        const user = await prismaFakeUser.create();
        const publisher = await prismaFakePublisher.create();
        const book = await prismaFakeBook.create({
            publisher: new BookPublisher(
                publisher.id.toString(),
                publisher.name,
            ),
        });

        vi.spyOn(booksRepository, 'removeBookFromStock');

        const result = await createReservationScheduleUseCase.execute({
            date: new Date(),
            userId: user.id.toString(),
            scheduleItems: [
                {
                    bookId: book.id.toString(),
                    name: book.name,
                },
            ],
            currentUserId: user.id.toString(),
        });

        expect(result.isRight()).toBeTruthy();
        expect(booksRepository.removeBookFromStock).toHaveBeenCalledWith(
            book.id.toString(),
            1,
        );

        expect(result.value).toEqual({
            id: expect.any(String),
            date: expect.any(Date),
            userId: user.id.toString(),
            scheduleItems: [
                expect.objectContaining({
                    id: expect.any(String),
                    bookId: book.id.toString(),
                    name: book.name,
                }),
            ],
            status: expect.any(String),
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
        });
    });
});
