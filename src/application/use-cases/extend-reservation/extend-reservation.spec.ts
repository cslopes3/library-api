import { Reservation } from '@domain/entities/reservation';
import { ReservationItem } from '@domain/value-objects/resevation-item';
import { ResourceNotFoundError } from '@usecase/@errors/resource-not-found-error';
import { ExtendReservationUseCase } from './extend-reservation';
import { AlreadyExtendedError } from '@usecase/@errors/already-extended-error';
import { ExpiredDateError } from '@usecase/@errors/expired-date-error';
import { AllItemsAlreadyReturnedError } from '@usecase/@errors/all-items-already-returned-error';

describe('[UT] - Extend Reservation by id use case', () => {
    it('should extend the reservation period', async () => {
        const reservation = new Reservation(
            {
                userId: '1',
                reservationItem: [
                    new ReservationItem(
                        '1',
                        'Book 1',
                        new Date(2999, 0, 1),
                        false,
                        false,
                    ),
                    new ReservationItem(
                        '2',
                        'Book 2',
                        new Date(2999, 0, 2),
                        false,
                        false,
                    ),
                ],
            },
            '1',
        );

        const MockRepository = () => {
            return {
                findById: vi.fn().mockReturnValue(Promise.resolve(reservation)),
                findByUserId: vi
                    .fn()
                    .mockReturnValue(Promise.resolve([reservation])),
                delete: vi.fn(),
                create: vi.fn(),
                changeReservationInfoById: vi.fn(),
                returnByItemId: vi.fn(),
                findItemById: vi.fn(),
            };
        };

        const reservationsRepository = MockRepository();
        const extendReservation = new ExtendReservationUseCase(
            reservationsRepository,
        );

        const result = await extendReservation.execute({ id: '1' });

        expect(result.isRight()).toBe(true);
        expect(result.value).toEqual({
            id: reservation.id.toString(),
            userId: reservation.userId,
            reservationItems: [
                expect.objectContaining({
                    id: expect.any(String),
                    bookId: reservation.reservationItem[0].bookId,
                    name: reservation.reservationItem[0].name,
                    expirationDate: new Date(2999, 0, 31),
                    alreadyExtendTime: true,
                    returned: reservation.reservationItem[0].returned,
                }),
                expect.objectContaining({
                    id: expect.any(String),
                    bookId: reservation.reservationItem[1].bookId,
                    name: reservation.reservationItem[1].name,
                    expirationDate: new Date(2999, 1, 1),
                    alreadyExtendTime: true,
                    returned: reservation.reservationItem[1].returned,
                }),
            ],
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
        });
    });

    it('should return error when reservation is not found', async () => {
        const MockRepository = () => {
            return {
                findById: vi.fn().mockReturnValue(Promise.resolve(null)),
                findByUserId: vi.fn(),
                delete: vi.fn(),
                create: vi.fn(),
                changeReservationInfoById: vi.fn(),
                returnByItemId: vi.fn(),
                findItemById: vi.fn(),
            };
        };

        const reservationsRepository = MockRepository();
        const extendReservation = new ExtendReservationUseCase(
            reservationsRepository,
        );

        const result = await extendReservation.execute({ id: '1' });

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(ResourceNotFoundError);
    });

    it('should not extend the reservation period more than one time', async () => {
        const reservation = new Reservation(
            {
                userId: '1',
                reservationItem: [
                    new ReservationItem(
                        '1',
                        'Book 1',
                        new Date(2999, 0, 1),
                        true,
                        false,
                    ),
                ],
            },
            '1',
        );

        const MockRepository = () => {
            return {
                findById: vi.fn().mockReturnValue(Promise.resolve(reservation)),
                findByUserId: vi
                    .fn()
                    .mockReturnValue(Promise.resolve([reservation])),
                delete: vi.fn(),
                create: vi.fn(),
                changeReservationInfoById: vi.fn(),
                returnByItemId: vi.fn(),
                findItemById: vi.fn(),
            };
        };

        const reservationsRepository = MockRepository();
        const extendReservation = new ExtendReservationUseCase(
            reservationsRepository,
        );

        const result = await extendReservation.execute({ id: '1' });

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(AlreadyExtendedError);
    });

    it('should not extend the reservation when it has a expired date', async () => {
        const reservation = new Reservation(
            {
                userId: '1',
                reservationItem: [
                    new ReservationItem(
                        '1',
                        'Book 1',
                        new Date(2023, 0, 1),
                        false,
                        false,
                    ),
                    new ReservationItem(
                        '2',
                        'Book 2',
                        new Date(2999, 0, 2),
                        false,
                        false,
                    ),
                ],
            },
            '1',
        );

        const MockRepository = () => {
            return {
                findById: vi.fn().mockReturnValue(Promise.resolve(reservation)),
                findByUserId: vi
                    .fn()
                    .mockReturnValue(Promise.resolve([reservation])),
                delete: vi.fn(),
                create: vi.fn(),
                changeReservationInfoById: vi.fn(),
                returnByItemId: vi.fn(),
                findItemById: vi.fn(),
            };
        };

        const reservationsRepository = MockRepository();
        const extendReservation = new ExtendReservationUseCase(
            reservationsRepository,
        );

        const result = await extendReservation.execute({ id: '1' });

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(ExpiredDateError);
    });

    it('should not extend the reservation when all items were returned', async () => {
        const reservation = new Reservation(
            {
                userId: '1',
                reservationItem: [
                    new ReservationItem(
                        '1',
                        'Book 1',
                        new Date(2999, 0, 1),
                        false,
                        true,
                    ),
                    new ReservationItem(
                        '2',
                        'Book 2',
                        new Date(2999, 0, 2),
                        false,
                        true,
                    ),
                ],
            },
            '1',
        );

        const MockRepository = () => {
            return {
                findById: vi.fn().mockReturnValue(Promise.resolve(reservation)),
                findByUserId: vi
                    .fn()
                    .mockReturnValue(Promise.resolve([reservation])),
                delete: vi.fn(),
                create: vi.fn(),
                changeReservationInfoById: vi.fn(),
                returnByItemId: vi.fn(),
                findItemById: vi.fn(),
            };
        };

        const reservationsRepository = MockRepository();
        const extendReservation = new ExtendReservationUseCase(
            reservationsRepository,
        );

        const result = await extendReservation.execute({ id: '1' });

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(AllItemsAlreadyReturnedError);
    });
});
