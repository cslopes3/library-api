import { PrismaService } from '@infra/database/prisma/prisma.service';
import { PrismaBooksRepository } from '@infra/database/prisma/repositories/prisma-books-repository';
import { PrismaReservationsRepository } from '@infra/database/prisma/repositories/prisma-reservations-repository';
import { PrismaSchedulesRepository } from '@infra/database/prisma/repositories/prisma-schedule-repository';
import { PrismaUsersRepository } from '@infra/database/prisma/repositories/prisma-users-repository';
import { CreateReservationScheduleUseCase } from '@usecase/create-reservation-schedule/create-reservation-schedule';
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
    });

    afterEach(async () => {
        await stopEnvironment(prisma);
    });

    it('should schedule a reservation', async () => {
        await prisma.user.create({
            data: {
                id: '1',
                name: 'User 1',
                email: 'email@email.com',
                password: '1234',
            },
        });

        await prisma.publisher.create({
            data: {
                id: '1',
                name: 'Publisher 1',
            },
        });

        await prisma.author.create({
            data: {
                id: '1',
                name: 'Author 1',
            },
        });

        await prisma.book.create({
            data: {
                id: '1',
                name: 'Book 1',
                editionNumber: 1,
                editionDescription: 'Description',
                editionYear: 2023,
                quantity: 10,
                available: 10,
                pages: 100,
                publisherId: '1',
            },
        });

        vi.spyOn(booksRepository, 'removeBookFromStock');

        const result = await createReservationScheduleUseCase.execute({
            date: new Date(),
            userId: '1',
            scheduleItems: [
                {
                    bookId: '1',
                    name: 'Book 1',
                },
            ],
        });

        expect(result.isRight()).toBeTruthy();
        expect(booksRepository.removeBookFromStock).toHaveBeenCalledWith(
            '1',
            1,
        );

        expect(result.value).toEqual({
            id: expect.any(String),
            date: expect.any(Date),
            userId: '1',
            scheduleItems: [
                expect.objectContaining({
                    id: expect.any(String),
                    bookId: '1',
                    name: 'Book 1',
                }),
            ],
            status: expect.any(String),
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
        });
    });
});
