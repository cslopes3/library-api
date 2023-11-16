import { FakeReservationFactory } from 'test/factories/fake-reservation-factory';
import { FindReservationByIdUseCase } from './find-reservation-by-id';
import { ReservationsMockRepository } from '@mocks/mock-reservations-repository';

let reservationsRepository: ReturnType<typeof ReservationsMockRepository>;

describe('[UT] - Find reservation by id use case', () => {
    beforeEach(() => {
        reservationsRepository = ReservationsMockRepository();
    });

    it('should find a reservation by id', async () => {
        const reservation = FakeReservationFactory.create();

        reservationsRepository.findById.mockResolvedValue(reservation);

        const findReservationByIdUseCase = new FindReservationByIdUseCase(
            reservationsRepository,
        );

        const result = await findReservationByIdUseCase.execute({
            id: reservation.id.toString(),
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
        );

        const result = await findReservationByIdUseCase.execute({ id: '1' });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toBeNull();
    });
});
