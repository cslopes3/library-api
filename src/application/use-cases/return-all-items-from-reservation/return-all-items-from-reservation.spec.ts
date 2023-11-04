import { Reservation } from '@domain/entities/reservation';
import { ReservationItem } from '@domain/value-objects/resevation-item';
import { AllItemsAlreadyReturnedError } from '@usecase/@errors/all-items-already-returned-error';
import { ResourceNotFoundError } from '@usecase/@errors/resource-not-found-error';
import { ReturnAllItemsFromReservationUseCase } from './return-all-items-from-reservation';

const reservation = new Reservation(
    {
        userId: '1',
        reservationItem: [
            new ReservationItem('1', 'Book 1', new Date(), false, false),
            new ReservationItem('1', 'Book 1', new Date(), false, false),
        ],
    },
    '1',
);

const ReservationsMockRepository = () => {
    return {
        findById: vi.fn().mockReturnValue(Promise.resolve(reservation)),
        findByUserId: vi.fn(),
        delete: vi.fn(),
        create: vi.fn(),
        changeReservationInfoById: vi.fn(),
        returnByItemId: vi.fn(),
        findItemById: vi.fn(),
    };
};

const BooksMockRepository = () => {
    return {
        findById: vi.fn(),
        findByName: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        addBookToStock: vi.fn(),
        removeBookFromStock: vi.fn(),
    };
};

describe('[UT] - Return all items from a reservation use case', () => {
    it('should return all items from reservation', async () => {
        const reservationsRepository = ReservationsMockRepository();
        const booksRepository = BooksMockRepository();

        const returnAllItemsFromReservation =
            new ReturnAllItemsFromReservationUseCase(
                reservationsRepository,
                booksRepository,
            );

        const result = await returnAllItemsFromReservation.execute({ id: '1' });

        expect(result.isRight()).toBe(true);
        expect(result.value).toEqual({
            id: reservation.id.toString(),
            userId: reservation.userId,
            reservationItems: [
                expect.objectContaining({
                    id: expect.any(String),
                    bookId: reservation.reservationItem[0].bookId,
                    name: reservation.reservationItem[0].name,
                    expirationDate: expect.any(Date),
                    alreadyExtendTime: false,
                    returned: true,
                    returnDate: expect.any(Date),
                }),
                expect.objectContaining({
                    id: expect.any(String),
                    bookId: reservation.reservationItem[1].bookId,
                    name: reservation.reservationItem[1].name,
                    expirationDate: expect.any(Date),
                    alreadyExtendTime: false,
                    returned: true,
                    returnDate: expect.any(Date),
                }),
            ],
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
        });
    });

    it('should return a message error when reservation is not found', async () => {
        const reservationsRepository = ReservationsMockRepository();
        const booksRepository = BooksMockRepository();

        const returnAllItemsFromReservation =
            new ReturnAllItemsFromReservationUseCase(
                reservationsRepository,
                booksRepository,
            );

        reservationsRepository.findById.mockReturnValue(Promise.resolve(null));

        const result = await returnAllItemsFromReservation.execute({ id: '1' });

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(ResourceNotFoundError);
    });

    it('should not extend the reservation when all items were returned', async () => {
        const reservationsRepository = ReservationsMockRepository();
        const booksRepository = BooksMockRepository();

        const returnAllItemsFromReservation =
            new ReturnAllItemsFromReservationUseCase(
                reservationsRepository,
                booksRepository,
            );

        const reservation = new Reservation(
            {
                userId: '1',
                reservationItem: [
                    new ReservationItem('1', 'Book 1', new Date(), false, true),
                    new ReservationItem('1', 'Book 1', new Date(), false, true),
                ],
            },
            '1',
        );

        reservationsRepository.findItemById.mockReturnValue(
            Promise.resolve(reservation),
        );

        const result = await returnAllItemsFromReservation.execute({ id: '1' });

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(AllItemsAlreadyReturnedError);
    });
});
