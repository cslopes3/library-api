import { ReservationsRepository } from '@repository/reservations-repository';
import {
    startEnvironment,
    stopEnvironment,
} from 'test/utils/test-environment-setup';
import { PrismaReservationsRepository } from './prisma-reservations-repository';
import { PrismaService } from '../prisma.service';
import { FakeUserFactory } from 'test/factories/fake-user-factory';
import { FakePublisherFactory } from 'test/factories/fake-publisher-factory';
import { FakeAuthorFactory } from 'test/factories/fake-author-factory';
import { FakeBookFactory } from 'test/factories/fake-book-factory';
import { BookAuthors } from '@domain/value-objects/book-authors';
import { BookPublisher } from '@domain/value-objects/book-publisher';
import { FakeReservationFactory } from 'test/factories/fake-reservation-factory';
import { ReservationItem } from '@domain/value-objects/resevation-item';
import { Reservation } from '@domain/entities/reservation';

let prisma: PrismaService;
let reservationsRepository: ReservationsRepository;

describe('[UT] - Reservations repository', () => {
    beforeEach(() => {
        prisma = new PrismaService();
        startEnvironment();
        reservationsRepository = new PrismaReservationsRepository(prisma);
    });

    afterEach(async () => {
        await stopEnvironment(prisma);
    });

    it('should create a reservation', async () => {
        const reservation = await createReservationObjectAndSetup();

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
        const reservation = await createReservationObjectAndSetup();

        await prisma.reservation.create({
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

        const result = await reservationsRepository.findById(
            reservation.id.toString(),
        );

        expect(result?.id).toEqual(reservation.id);
        expect(result?.userId).toEqual(reservation.userId);
    });

    it('should find reservations by user id', async () => {
        const reservation = await createReservationObjectAndSetup();

        await prisma.reservation.create({
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

        const result = await reservationsRepository.findByUserId(
            reservation.userId,
        );

        expect(result[0]?.id).toEqual(reservation.id);
        expect(result[0]?.userId).toEqual(reservation.userId);
    });

    it('should delete a reservation', async () => {
        const reservation = await createReservationObjectAndSetup();

        await prisma.reservation.create({
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

        vi.spyOn(prisma.reservation, 'delete');
        vi.spyOn(prisma.reservationItem, 'deleteMany');

        await reservationsRepository.delete(reservation.id.toString());

        expect(prisma.reservationItem.deleteMany).toHaveBeenCalledWith({
            where: {
                id: { in: reservation.reservationItem.map((item) => item.id) },
            },
        });

        expect(prisma.reservation.delete).toHaveBeenCalledWith({
            where: {
                id: reservation.id.toString(),
            },
            include: {
                reservationItems: true,
            },
        });
    });

    it('should change reservation info by id', async () => {
        const reservation = await createReservationObjectAndSetup();

        await prisma.reservation.create({
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
                reservationId: reservation.id.toString(),
            },
        });
    });

    it('should return by item id', async () => {
        const reservation = await createReservationObjectAndSetup();

        await prisma.reservation.create({
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
        const reservation = await createReservationObjectAndSetup();

        await prisma.reservation.create({
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

async function createReservationObjectAndSetup(): Promise<Reservation> {
    const user = FakeUserFactory.create();
    const publisher = FakePublisherFactory.create();
    const author = FakeAuthorFactory.create();
    const book = FakeBookFactory.create({
        authors: [new BookAuthors(author.id.toString(), author.name)],
        publisher: new BookPublisher(publisher.id.toString(), publisher.name),
    });
    const reservation = FakeReservationFactory.create({
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

    await prisma.publisher.create({
        data: {
            id: publisher.id.toString(),
            name: publisher.name,
        },
    });

    await prisma.author.create({
        data: {
            id: author.id.toString(),
            name: author.name,
        },
    });

    await prisma.book.create({
        data: {
            id: book.id.toString(),
            name: book.name,
            publisherId: book.publisher.id,
            editionNumber: book.edition.number,
            editionDescription: book.edition.description,
            editionYear: book.edition.year,
            quantity: book.quantity,
            available: book.available,
            pages: book.pages,
        },
    });

    await prisma.user.create({
        data: {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            password: user.password,
        },
    });

    return reservation;
}
