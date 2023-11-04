import { Reservation } from '@domain/entities/reservation';
import { ReservationItem } from '@domain/value-objects/resevation-item';
import { FindReservationByIdUseCase } from './find-reservation-by-id';

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

const MockRepository = () => {
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

describe('[UT] - Find reservation by id use case', () => {
    it('should find a reservation by id', async () => {
        const reservationsRepository = MockRepository();
        const findReservationByIdUseCase = new FindReservationByIdUseCase(
            reservationsRepository,
        );

        const result = await findReservationByIdUseCase.execute({ id: '1' });

        expect(result.isRight()).toBe(true);
        expect(result.value).toEqual({
            id: expect.any(String),
            userId: reservation.userId,
            reservationItems: [
                expect.objectContaining({
                    id: expect.any(String),
                    bookId: reservation.reservationItem[0].bookId,
                    name: reservation.reservationItem[0].name,
                    expirationDate: expect.any(Date),
                    alreadyExtendTime: false,
                    returned: false,
                }),
                expect.objectContaining({
                    id: expect.any(String),
                    bookId: reservation.reservationItem[1].bookId,
                    name: reservation.reservationItem[1].name,
                    expirationDate: expect.any(Date),
                    alreadyExtendTime: false,
                    returned: false,
                }),
            ],
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
        });
    });

    it('should return null when a reservation is not find', async () => {
        const reservationsRepository = MockRepository();
        reservationsRepository.findById.mockReturnValue(Promise.resolve(null));

        const findReservationByIdUseCase = new FindReservationByIdUseCase(
            reservationsRepository,
        );

        const result = await findReservationByIdUseCase.execute({ id: '1' });

        expect(result.isRight()).toBe(true);
        expect(result.value).toBeNull();
    });
});
