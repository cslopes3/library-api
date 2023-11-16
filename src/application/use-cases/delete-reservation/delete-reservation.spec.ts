import { DeleteReservationUseCase } from './delete-reservation';
import { ResourceNotFoundError } from '@usecase/@errors/resource-not-found-error';
import { ReservationsMockRepository } from '@mocks/mock-reservations-repository';
import { BooksMockRepository } from '@mocks/mock-books-repository';
import { FakeReservationFactory } from 'test/factories/fake-reservation-factory';

let reservationsRepository: ReturnType<typeof ReservationsMockRepository>;
let booksRepository: ReturnType<typeof BooksMockRepository>;

describe('[UT] - Delete reservation use case', () => {
    beforeEach(() => {
        reservationsRepository = ReservationsMockRepository();
        booksRepository = BooksMockRepository();
    });

    it('should delete a reservation', async () => {
        const reservation = FakeReservationFactory.create();
        const deleteReservationUseCase = new DeleteReservationUseCase(
            reservationsRepository,
            booksRepository,
        );

        reservationsRepository.findById.mockResolvedValue(reservation);

        const result = await deleteReservationUseCase.execute({
            id: reservation.id.toString(),
        });

        expect(result.isRight()).toBeTruthy();
    });

    it('should return error when reservation is not found', async () => {
        const deleteReservationUseCase = new DeleteReservationUseCase(
            reservationsRepository,
            booksRepository,
        );

        const result = await deleteReservationUseCase.execute({ id: '1' });

        expect(result.isLeft()).toBeTruthy();
        expect(result.value).toBeInstanceOf(ResourceNotFoundError);
    });
});
