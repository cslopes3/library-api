import { UserDoesNotExistsError } from '@usecase/@errors/user-does-not-exists-error';
import { FindReservationsByUserIdUseCase } from './find-reservations-by-user-id';
import { ReservationsMockRepository } from '@mocks/mock-reservations-repository';
import { UsersMockRepository } from '@mocks/mock-users-repository';
import { createFakeUser } from 'test/factories/fake-user-factory';
import { createFakeReservation } from 'test/factories/fake-reservation-factory';
import { NotAllowedError } from '@usecase/@errors/not-allowed-error';
import { UserRole } from '@shared/utils/user-role';

let reservationsRepository: ReturnType<typeof ReservationsMockRepository>;
let usersRepository: ReturnType<typeof UsersMockRepository>;

describe('[UT] - Find reservation by user id use case', () => {
    beforeEach(() => {
        reservationsRepository = ReservationsMockRepository();
        usersRepository = UsersMockRepository();
    });

    it('should find a reservation by user id', async () => {
        const user = createFakeUser();
        const reservation = [
            createFakeReservation({
                userId: user.id.toString(),
            }),
        ];

        usersRepository.findById.mockResolvedValue(user);
        reservationsRepository.findByUserId.mockResolvedValue(reservation);

        const findReservationByUserIdUseCase =
            new FindReservationsByUserIdUseCase(
                reservationsRepository,
                usersRepository,
            );

        const result = await findReservationByUserIdUseCase.execute({
            userId: user.id.toString(),
            currentUserId: user.id.toString(),
        });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toEqual([
            {
                id: expect.any(String),
                userId: reservation[0].userId,
                reservationItems: [
                    expect.objectContaining({
                        id: expect.any(String),
                        bookId: reservation[0].reservationItem[0].bookId,
                        name: reservation[0].reservationItem[0].name,
                        expirationDate: expect.any(Date),
                        alreadyExtendTime:
                            reservation[0].reservationItem[0].alreadyExtendTime,
                        returned: reservation[0].reservationItem[0].returned,
                    }),
                ],
                createdAt: expect.any(Date),
                updatedAt: expect.any(Date),
            },
        ]);
    });

    it('should return an empty array when not found a reservation', async () => {
        const user = createFakeUser();

        usersRepository.findById.mockResolvedValue(user);
        reservationsRepository.findByUserId.mockResolvedValue([]);

        const findReservationByUserIdUseCase =
            new FindReservationsByUserIdUseCase(
                reservationsRepository,
                usersRepository,
            );

        const result = await findReservationByUserIdUseCase.execute({
            userId: '1',
            currentUserId: '1',
        });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toHaveLength(0);
    });

    it('should return a message error when a user does not exists', async () => {
        const findReservationByUserIdUseCase =
            new FindReservationsByUserIdUseCase(
                reservationsRepository,
                usersRepository,
            );

        const result = await findReservationByUserIdUseCase.execute({
            userId: '1',
            currentUserId: '1',
        });

        expect(result.isLeft()).toBeTruthy();
        expect(result.value).toBeInstanceOf(UserDoesNotExistsError);
    });

    it('should return error when user is not the admin or the owner', async () => {
        const user = createFakeUser();
        const currentUser = createFakeUser({ role: 'user' as UserRole });
        const reservation = [
            createFakeReservation({
                userId: user.id.toString(),
            }),
        ];

        usersRepository.findById
            .mockResolvedValueOnce(user)
            .mockResolvedValueOnce(currentUser);
        reservationsRepository.findByUserId.mockResolvedValue(reservation);

        const findReservationByUserIdUseCase =
            new FindReservationsByUserIdUseCase(
                reservationsRepository,
                usersRepository,
            );

        const result = await findReservationByUserIdUseCase.execute({
            userId: user.id.toString(),
            currentUserId: currentUser.id.toString(),
        });

        expect(result.isLeft()).toBeTruthy();
        expect(result.value).toBeInstanceOf(NotAllowedError);
    });
});
