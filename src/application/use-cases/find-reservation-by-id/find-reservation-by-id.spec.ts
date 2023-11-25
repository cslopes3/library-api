import { createFakeReservation } from 'test/factories/fake-reservation-factory';
import { FindReservationByIdUseCase } from './find-reservation-by-id';
import { ReservationsMockRepository } from '@mocks/mock-reservations-repository';
import { UsersMockRepository } from '@mocks/mock-users-repository';
import { createFakeUser } from 'test/factories/fake-user-factory';
import { UserRole } from '@shared/utils/user-role';
import { NotAllowedError } from '@usecase/@errors/not-allowed-error';

let reservationsRepository: ReturnType<typeof ReservationsMockRepository>;
let usersRepository: ReturnType<typeof UsersMockRepository>;

describe('[UT] - Find reservation by id use case', () => {
    beforeEach(() => {
        reservationsRepository = ReservationsMockRepository();
        usersRepository = UsersMockRepository();
    });

    it('should find a reservation by id', async () => {
        const user = createFakeUser();
        const reservation = createFakeReservation();

        reservationsRepository.findById.mockResolvedValue(reservation);
        usersRepository.findById.mockResolvedValue(user);

        const findReservationByIdUseCase = new FindReservationByIdUseCase(
            reservationsRepository,
            usersRepository,
        );

        const result = await findReservationByIdUseCase.execute({
            id: reservation.id.toString(),
            currentUserId: reservation.userId,
        });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toEqual({
            id: expect.any(String),
            userId: reservation.userId,
            reservationItems: [
                expect.objectContaining({
                    id: expect.any(String),
                    bookId: reservation.reservationItem[0].bookId,
                    name: reservation.reservationItem[0].name,
                    expirationDate: expect.any(Date),
                    alreadyExtendTime:
                        reservation.reservationItem[0].alreadyExtendTime,
                    returned: reservation.reservationItem[0].returned,
                }),
            ],
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
        });
    });

    it('should return null when a reservation is not find', async () => {
        const findReservationByIdUseCase = new FindReservationByIdUseCase(
            reservationsRepository,
            usersRepository,
        );

        const result = await findReservationByIdUseCase.execute({
            id: '1',
            currentUserId: '1',
        });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toBeNull();
    });

    it('should return error when user is not the admin or the owner', async () => {
        const user = createFakeUser({ role: 'user' as UserRole });
        const currentUser = createFakeUser({ role: 'user' as UserRole });
        const reservation = createFakeReservation({
            userId: user.id.toString(),
        });

        reservationsRepository.findById.mockResolvedValue(reservation);
        usersRepository.findById.mockResolvedValue(currentUser);

        const findReservationByIdUseCase = new FindReservationByIdUseCase(
            reservationsRepository,
            usersRepository,
        );

        const result = await findReservationByIdUseCase.execute({
            id: reservation.id.toString(),
            currentUserId: currentUser.id.toString(),
        });

        expect(result.isLeft()).toBeTruthy();
        expect(result.value).toBeInstanceOf(NotAllowedError);
    });
});
