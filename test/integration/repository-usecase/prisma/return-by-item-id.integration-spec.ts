import { BookPublisher } from '@domain/value-objects/book-publisher';
import { ReservationItem } from '@domain/value-objects/resevation-item';
import { PrismaService } from '@infra/database/prisma/prisma.service';
import { PrismaBooksRepository } from '@infra/database/prisma/repositories/prisma-books-repository';
import { PrismaReservationsRepository } from '@infra/database/prisma/repositories/prisma-reservations-repository';
import { ReturnByItemIdUseCase } from '@usecase/return-by-item-id/return-by-item-id';
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
let returnByItemIdUseCase: ReturnByItemIdUseCase;
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
        returnByItemIdUseCase = new ReturnByItemIdUseCase(
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

    it('should return an item', async () => {
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

        vi.spyOn(booksRepository, 'addBookToStock');
        vi.spyOn(reservationsRepository, 'returnByItemId');

        const result = await returnByItemIdUseCase.execute({
            id: reservation.reservationItem[0].id.toString(),
        });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toMatchObject({
            id: reservation.reservationItem[0].id.toString(),
            bookId: reservation.reservationItem[0].bookId,
            name: reservation.reservationItem[0].name,
            expirationDate: expect.any(Date),
            alreadyExtendTime: expect.any(Boolean),
            returned: true,
            returnDate: expect.any(Date),
        });
        expect(booksRepository.addBookToStock).toHaveBeenCalledWith(
            reservation.reservationItem[0].bookId,
            1,
        );
        expect(reservationsRepository.returnByItemId).toHaveBeenCalledWith(
            reservation.reservationItem[0].id.toString(),
            expect.any(Date),
        );
    });
});
