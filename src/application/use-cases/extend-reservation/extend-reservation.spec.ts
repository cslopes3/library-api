import { ReservationItem } from '@domain/value-objects/resevation-item';
import { ResourceNotFoundError } from '@usecase/@errors/resource-not-found-error';
import { ExtendReservationUseCase } from './extend-reservation';
import { AlreadyExtendedError } from '@usecase/@errors/already-extended-error';
import { ExpiredDateError } from '@usecase/@errors/expired-date-error';
import { AllItemsAlreadyReturnedError } from '@usecase/@errors/all-items-already-returned-error';
import { ReservationsMockRepository } from '@mocks/mock-reservations-repository';
import { createFakeReservation } from 'test/factories/fake-reservation-factory';
import { UsersMockRepository } from '@mocks/mock-users-repository';
import { UserRole } from '@shared/utils/user-role';
import { NotAllowedError } from '@usecase/@errors/not-allowed-error';
import { createFakeUser } from 'test/factories/fake-user-factory';

let reservationsRepository: ReturnType<typeof ReservationsMockRepository>;
let usersRepository: ReturnType<typeof UsersMockRepository>;

describe('[UT] - Extend Reservation by id use case', () => {
    beforeEach(() => {
        reservationsRepository = ReservationsMockRepository();
        usersRepository = UsersMockRepository();
    });

    it('should extend the reservation period', async () => {
        const user = createFakeUser();
        const reservation = createFakeReservation({
            userId: user.id.toString(),
        });

        reservationsRepository.findById.mockResolvedValue(reservation);
        reservationsRepository.findByUserId.mockResolvedValue([reservation]);
        usersRepository.findById.mockResolvedValue(user);

        const extendReservation = new ExtendReservationUseCase(
            reservationsRepository,
            usersRepository,
        );

        const result = await extendReservation.execute({
            id: reservation.id.toString(),
            currentUserId: reservation.userId,
        });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toEqual({
            id: reservation.id.toString(),
            userId: reservation.userId,
            reservationItems: [
                expect.objectContaining({
                    id: expect.any(String),
                    bookId: reservation.reservationItem[0].bookId,
                    name: reservation.reservationItem[0].name,
                    expirationDate: expect.any(Date),
                    alreadyExtendTime: true,
                    returned: reservation.reservationItem[0].returned,
                }),
            ],
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
        });
    });

    it('should return error when reservation is not found', async () => {
        const extendReservation = new ExtendReservationUseCase(
            reservationsRepository,
            usersRepository,
        );

        const result = await extendReservation.execute({
            id: '1',
            currentUserId: '1',
        });

        expect(result.isLeft()).toBeTruthy();
        expect(result.value).toBeInstanceOf(ResourceNotFoundError);
    });

    it('should not extend the reservation period more than one time', async () => {
        const user = createFakeUser();
        const reservation = createFakeReservation({
            userId: user.id.toString(),
            reservationItem: [
                new ReservationItem(
                    '1',
                    'Book 1',
                    new Date(2999, 0, 1),
                    true,
                    false,
                ),
            ],
        });

        reservationsRepository.findById.mockResolvedValue(reservation);
        reservationsRepository.findByUserId.mockResolvedValue([reservation]);
        usersRepository.findById.mockResolvedValue(user);

        const extendReservation = new ExtendReservationUseCase(
            reservationsRepository,
            usersRepository,
        );

        const result = await extendReservation.execute({
            id: reservation.id.toString(),
            currentUserId: reservation.userId,
        });

        expect(result.isLeft()).toBeTruthy();
        expect(result.value).toBeInstanceOf(AlreadyExtendedError);
    });

    it('should not extend the reservation when it has a expired date', async () => {
        const user = createFakeUser();
        const reservation = createFakeReservation({
            userId: user.id.toString(),
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
        });

        reservationsRepository.findById.mockResolvedValue(reservation);
        reservationsRepository.findByUserId.mockResolvedValue([reservation]);
        usersRepository.findById.mockResolvedValue(user);

        const extendReservation = new ExtendReservationUseCase(
            reservationsRepository,
            usersRepository,
        );

        const result = await extendReservation.execute({
            id: reservation.id.toString(),
            currentUserId: reservation.userId,
        });

        expect(result.isLeft()).toBeTruthy();
        expect(result.value).toBeInstanceOf(ExpiredDateError);
    });

    it('should not extend the reservation when all items were returned', async () => {
        const user = createFakeUser();
        const reservation = createFakeReservation({
            userId: user.id.toString(),
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
        });

        reservationsRepository.findById.mockResolvedValue(reservation);
        reservationsRepository.findByUserId.mockResolvedValue([reservation]);
        usersRepository.findById.mockResolvedValue(user);

        const extendReservation = new ExtendReservationUseCase(
            reservationsRepository,
            usersRepository,
        );

        const result = await extendReservation.execute({
            id: reservation.id.toString(),
            currentUserId: reservation.userId,
        });

        expect(result.isLeft()).toBeTruthy();
        expect(result.value).toBeInstanceOf(AllItemsAlreadyReturnedError);
    });

    it('should return error when user is not the admin or the owner', async () => {
        const user = createFakeUser({ role: 'user' as UserRole });
        const currentUser = createFakeUser({ role: 'user' as UserRole });
        const reservation = createFakeReservation({
            userId: user.id.toString(),
        });

        reservationsRepository.findById.mockResolvedValue(reservation);
        usersRepository.findById.mockResolvedValue(currentUser);

        const extendReservation = new ExtendReservationUseCase(
            reservationsRepository,
            usersRepository,
        );

        const result = await extendReservation.execute({
            id: reservation.id.toString(),
            currentUserId: currentUser.id.toString(),
        });

        expect(result.isLeft()).toBeTruthy();
        expect(result.value).toBeInstanceOf(NotAllowedError);
    });
});
