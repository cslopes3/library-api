import { ReservationsRepository } from '@repository/reservations-repository';
import {
    startEnvironment,
    stopEnvironment,
} from 'test/utils/test-environment-setup';
import { PrismaReservationsRepository } from './prisma-reservations-repository';
import { PrismaService } from '../prisma.service';
import { PrismaFakeUser } from 'test/factories/fake-user-factory';
import { PrismaFakePublisher } from 'test/factories/fake-publisher-factory';
import { PrismaFakeAuthor } from 'test/factories/fake-author-factory';
import { PrismaFakeBook } from 'test/factories/fake-book-factory';
import { BookAuthors } from '@domain/value-objects/book-authors';
import { BookPublisher } from '@domain/value-objects/book-publisher';
import {
    PrismaFakeReservation,
    createFakeReservation,
} from 'test/factories/fake-reservation-factory';
import { ReservationItem } from '@domain/value-objects/resevation-item';
import { Reservation } from '@domain/entities/reservation';

let prisma: PrismaService;
let reservationsRepository: ReservationsRepository;
let prismaFakeUser: PrismaFakeUser;
let prismaFakePublisher: PrismaFakePublisher;
let prismaFakeAuthor: PrismaFakeAuthor;
let prismaFakeBook: PrismaFakeBook;
let prismaFakeReservation: PrismaFakeReservation;

describe('[UT] - Reservations repository', () => {
    beforeEach(() => {
        prisma = new PrismaService();
        startEnvironment();
        reservationsRepository = new PrismaReservationsRepository(prisma);

        prismaFakeUser = new PrismaFakeUser(prisma);
        prismaFakePublisher = new PrismaFakePublisher(prisma);
        prismaFakeAuthor = new PrismaFakeAuthor(prisma);
        prismaFakeBook = new PrismaFakeBook(prisma);
        prismaFakeReservation = new PrismaFakeReservation(prisma);
    });

    afterEach(async () => {
        await stopEnvironment(prisma);
    });

    it('should create a reservation', async () => {
        const user = await prismaFakeUser.create();
        const publisher = await prismaFakePublisher.create();
        const author = await prismaFakeAuthor.create();
        const book = await prismaFakeBook.create({
            publisher: new BookPublisher(
                publisher.id.toString(),
                publisher.name,
            ),
            authors: [new BookAuthors(author.id.toString(), author.name)],
        });

        const reservation = createFakeReservation({
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

        vi.spyOn(prisma.reservation, 'create');

        await reservationsRepository.create(reservation);

        expect(prisma.reservation.create).toHaveBeenCalledWith({
            data: {
                id: reservation.id.toString(),
                userId: reservation.userId,
                reservationItems: {
                    create: reservation.reservationItem.map((item) => ({
                        id: item.id.toString(),
                        bookId: item.bookId,
                        name: item.name,
                        expirationDate: item.expirationDate,
                        alreadyExtendTime: item.alreadyExtendTime,
                        returned: item.returned,
                    })),
                },
            },
        });
    });

    it('should find a reservation by id', async () => {
        const reservation = await createReservationSetup();

        const result = await reservationsRepository.findById(
            reservation.id.toString(),
        );

        expect(result?.id).toEqual(reservation.id);
        expect(result?.userId).toEqual(reservation.userId);
    });

    it('should find reservations by user id', async () => {
        const reservation = await createReservationSetup();

        const result = await reservationsRepository.findByUserId(
            reservation.userId,
        );

        expect(result[0]?.id).toEqual(reservation.id);
        expect(result[0]?.userId).toEqual(reservation.userId);
    });

    it('should delete a reservation', async () => {
        const reservation = await createReservationSetup();

        vi.spyOn(prisma.reservation, 'delete');
        vi.spyOn(prisma.reservationItem, 'deleteMany');

        await reservationsRepository.delete(reservation.id.toString());

        expect(prisma.reservationItem.deleteMany).toHaveBeenCalledWith({
            where: {
                id: {
                    in: reservation.reservationItem.map((item) =>
                        item.id.toString(),
                    ),
                },
            },
        });

        expect(prisma.reservation.delete).toHaveBeenCalledWith({
            where: {
                id: reservation.id.toString(),
            },
        });
    });

    it('should change reservation info by id', async () => {
        const reservation = await createReservationSetup();

        vi.spyOn(prisma.reservationItem, 'updateMany');

        const expirationDate = new Date();

        await reservationsRepository.changeReservationInfoById(
            reservation.id.toString(),
            expirationDate,
            true,
        );

        expect(prisma.reservationItem.updateMany).toHaveBeenCalledWith({
            data: {
                expirationDate,
                alreadyExtendTime: true,
            },
            where: {
                id: reservation.reservationItem[0].id.toString(),
            },
        });
    });

    it('should return by item id', async () => {
        const reservation = await createReservationSetup();

        vi.spyOn(prisma.reservationItem, 'update');

        const returnDate = new Date();

        await reservationsRepository.returnByItemId(
            reservation.reservationItem[0].id.toString(),
            returnDate,
        );

        expect(prisma.reservationItem.update).toHaveBeenCalledWith({
            data: {
                returnDate,
                returned: true,
            },
            where: {
                id: reservation.reservationItem[0].id.toString(),
            },
        });
    });

    it('should find a item by id', async () => {
        const reservation = await createReservationSetup();

        vi.spyOn(prisma.reservationItem, 'findUnique');

        await reservationsRepository.findItemById(
            reservation.reservationItem[0].id.toString(),
        );

        expect(prisma.reservationItem.findUnique).toHaveBeenCalledWith({
            where: {
                id: reservation.reservationItem[0].id.toString(),
            },
        });
    });
});

async function createReservationSetup(): Promise<Reservation> {
    const user = await prismaFakeUser.create();
    const publisher = await prismaFakePublisher.create();
    const author = await prismaFakeAuthor.create();
    const book = await prismaFakeBook.create({
        publisher: new BookPublisher(publisher.id.toString(), publisher.name),
        authors: [new BookAuthors(author.id.toString(), author.name)],
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

    return reservation;
}
