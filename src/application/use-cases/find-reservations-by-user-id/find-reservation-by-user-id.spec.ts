import { Reservation } from '@domain/entities/reservation';
import { User } from '@domain/entities/user';
import { ReservationItem } from '@domain/value-objects/resevation-item';
import { UserDoesNotExistsError } from '@usecase/@errors/user-does-not-exists-error';
import { FindReservationByUserIdUseCase } from './find-reservation-by-user-id';

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

const ReservationMockRepository = () => {
    return {
        findById: vi.fn(),
        findByUserId: vi.fn().mockReturnValue(Promise.resolve([reservation])),
        delete: vi.fn(),
        create: vi.fn(),
        changeReservationInfoById: vi.fn(),
        returnByItemId: vi.fn(),
        findItemById: vi.fn(),
    };
};

const user = new User(
    {
        name: 'User 1',
        email: 'user1@example.com',
        password: '123456',
    },
    '1',
);

const UserMockRepository = () => {
    return {
        findById: vi.fn().mockReturnValue(Promise.resolve(user)),
        findByEmail: vi.fn(),
        create: vi.fn(),
    };
};

describe('[UT] - Find reservation by user id use case', () => {
    it('should find a reservation by user id', async () => {
        const reservationsRepository = ReservationMockRepository();
        const usersRepository = UserMockRepository();

        const findReservationByUserIdUseCase =
            new FindReservationByUserIdUseCase(
                reservationsRepository,
                usersRepository,
            );

        const result = await findReservationByUserIdUseCase.execute({
            userId: '1',
        });

        expect(result.isRight()).toBe(true);
        expect(result.value).toEqual([
            {
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
            },
        ]);
    });

    it('should return an empty array when not found a reservation', async () => {
        const reservationsRepository = ReservationMockRepository();
        const usersRepository = UserMockRepository();

        reservationsRepository.findByUserId.mockReturnValue(
            Promise.resolve([]),
        );

        const findReservationByUserIdUseCase =
            new FindReservationByUserIdUseCase(
                reservationsRepository,
                usersRepository,
            );

        const result = await findReservationByUserIdUseCase.execute({
            userId: '1',
        });

        expect(result.isRight()).toBe(true);
        expect(result.value).toHaveLength(0);
    });

    it('should return a message error when a user does not exists', async () => {
        const reservationsRepository = ReservationMockRepository();
        const usersRepository = UserMockRepository();

        usersRepository.findById.mockReturnValue(Promise.resolve(null));

        const findReservationByUserIdUseCase =
            new FindReservationByUserIdUseCase(
                reservationsRepository,
                usersRepository,
            );

        const result = await findReservationByUserIdUseCase.execute({
            userId: '1',
        });

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(UserDoesNotExistsError);
    });
});
