import { UserDoesNotExistsError } from '@usecase/@errors/user-does-not-exists-error';
import { FindReservationsByUserIdUseCase } from './find-reservations-by-user-id';
import { ReservationsMockRepository } from '@mocks/mock-reservations-repository';
import { UsersMockRepository } from '@mocks/mock-users-repository';
import { FakeUserFactory } from 'test/factories/fake-user-factory';
import { FakeReservationFactory } from 'test/factories/fake-reservation-factory';

let reservationsRepository: ReturnType<typeof ReservationsMockRepository>;
let usersRepository: ReturnType<typeof UsersMockRepository>;

describe('[UT] - Find reservation by user id use case', () => {
    beforeEach(() => {
        reservationsRepository = ReservationsMockRepository();
        usersRepository = UsersMockRepository();
    });

    it('should find a reservation by user id', async () => {
        const user = FakeUserFactory.create();
        const reservation = [
            FakeReservationFactory.create({
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
        const user = FakeUserFactory.create();

        usersRepository.findById.mockResolvedValue(user);
        reservationsRepository.findByUserId.mockResolvedValue([]);

        const findReservationByUserIdUseCase =
            new FindReservationsByUserIdUseCase(
                reservationsRepository,
                usersRepository,
            );

        const result = await findReservationByUserIdUseCase.execute({
            userId: '1',
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
        });

        expect(result.isLeft()).toBeTruthy();
        expect(result.value).toBeInstanceOf(UserDoesNotExistsError);
    });
});
