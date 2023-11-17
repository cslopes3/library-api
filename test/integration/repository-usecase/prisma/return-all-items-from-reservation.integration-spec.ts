import { BookPublisher } from '@domain/value-objects/book-publisher';
import { ReservationItem } from '@domain/value-objects/resevation-item';
import { PrismaService } from '@infra/database/prisma/prisma.service';
import { PrismaBooksRepository } from '@infra/database/prisma/repositories/prisma-books-repository';
import { PrismaReservationsRepository } from '@infra/database/prisma/repositories/prisma-reservations-repository';
import { ReturnAllItemsFromReservationUseCase } from '@usecase/return-all-items-from-reservation/return-all-items-from-reservation';
import { PrismaFakeBook } from 'test/factories/fake-book-factory';
import { PrismaFakePublisher } from 'test/factories/fake-publisher-factory';
import { PrismaFakeReservation } from 'test/factories/fake-reservation-factory';
import { PrismaFakeUser } from 'test/factories/fake-user-factory';
import {
    startEnvironment,
    stopEnvironment,
} from 'test/utils/test-environment-setup';

let prisma: PrismaService;
let booksRepository: PrismaBooksRepository;
let reservationsRepository: PrismaReservationsRepository;
let returnAllItemsFromReservationUseCase: ReturnAllItemsFromReservationUseCase;
let prismaFakeUser: PrismaFakeUser;
let prismaFakePublisher: PrismaFakePublisher;
let prismaFakeBook: PrismaFakeBook;
let prismaFakeReservation: PrismaFakeReservation;

describe('[IT] - Return all items from reservation', () => {
    beforeEach(() => {
        prisma = new PrismaService();
        startEnvironment();
        reservationsRepository = new PrismaReservationsRepository(prisma);
        booksRepository = new PrismaBooksRepository(prisma);
        returnAllItemsFromReservationUseCase =
            new ReturnAllItemsFromReservationUseCase(
                reservationsRepository,
                booksRepository,
            );

        prismaFakeUser = new PrismaFakeUser(prisma);
        prismaFakePublisher = new PrismaFakePublisher(prisma);
        prismaFakeBook = new PrismaFakeBook(prisma);
        prismaFakeReservation = new PrismaFakeReservation(prisma);
    });

    afterEach(async () => {
        await stopEnvironment(prisma);
    });

    it('should return all items from reservation', async () => {
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

        const result = await returnAllItemsFromReservationUseCase.execute({
            id: reservation.id.toString(),
        });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toEqual({
            id: reservation.id.toString(),
            userId: reservation.userId,
            reservationItems: [
                expect.objectContaining({
                    id: expect.any(String),
                    bookId: reservation.reservationItem[0].bookId,
                    name: reservation.reservationItem[0].name,
                    expirationDate: expect.any(Date),
                    alreadyExtendTime: expect.any(Boolean),
                    returned: true,
                    returnDate: expect.any(Date),
                }),
            ],
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
        });
    });
});
