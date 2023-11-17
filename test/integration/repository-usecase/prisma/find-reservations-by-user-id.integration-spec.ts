import { BookPublisher } from '@domain/value-objects/book-publisher';
import { ReservationItem } from '@domain/value-objects/resevation-item';
import { PrismaService } from '@infra/database/prisma/prisma.service';
import { PrismaReservationsRepository } from '@infra/database/prisma/repositories/prisma-reservations-repository';
import { PrismaUsersRepository } from '@infra/database/prisma/repositories/prisma-users-repository';
import { FindReservationsByUserIdUseCase } from '@usecase/find-reservations-by-user-id/find-reservations-by-user-id';
import { PrismaFakeBook } from 'test/factories/fake-book-factory';
import { PrismaFakePublisher } from 'test/factories/fake-publisher-factory';
import { PrismaFakeReservation } from 'test/factories/fake-reservation-factory';
import { PrismaFakeUser } from 'test/factories/fake-user-factory';
import {
    startEnvironment,
    stopEnvironment,
} from 'test/utils/test-environment-setup';

let prisma: PrismaService;
let reservationsRepository: PrismaReservationsRepository;
let usersRepository: PrismaUsersRepository;
let findReservationsByUserIdUseCase: FindReservationsByUserIdUseCase;
let prismaFakeUser: PrismaFakeUser;
let prismaFakePublisher: PrismaFakePublisher;
let prismaFakeBook: PrismaFakeBook;
let prismaFakeReservation: PrismaFakeReservation;

describe('[IT] - Find reservation by user id', () => {
    beforeEach(() => {
        prisma = new PrismaService();
        startEnvironment();
        reservationsRepository = new PrismaReservationsRepository(prisma);
        usersRepository = new PrismaUsersRepository(prisma);
        findReservationsByUserIdUseCase = new FindReservationsByUserIdUseCase(
            reservationsRepository,
            usersRepository,
        );

        prismaFakeUser = new PrismaFakeUser(prisma);
        prismaFakePublisher = new PrismaFakePublisher(prisma);
        prismaFakeBook = new PrismaFakeBook(prisma);
        prismaFakeReservation = new PrismaFakeReservation(prisma);
    });

    afterEach(async () => {
        await stopEnvironment(prisma);
    });

    it('should find a reservation by user id', async () => {
        const user = await prismaFakeUser.create();
        const publisher = await prismaFakePublisher.create();
        const book = await prismaFakeBook.create({
            publisher: new BookPublisher(
                publisher.id.toString(),
                publisher.name,
            ),
            quantity: 10,
            available: 9,
        });
        const reservation = await prismaFakeReservation.create({
            userId: user.id.toString(),
            reservationItem: [
                new ReservationItem(
                    book.id.toString(),
                    book.name,
                    new Date(),
                    false,
                    false,
                ),
            ],
        });

        const result = await findReservationsByUserIdUseCase.execute({
            userId: reservation.userId,
        });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toHaveLength(1);
    });

    it('should return an empty array when not found a reservation', async () => {
        const user = await prismaFakeUser.create();

        const result = await findReservationsByUserIdUseCase.execute({
            userId: user.id.toString(),
        });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toHaveLength(0);
    });
});
