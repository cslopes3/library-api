import { ReservationItem } from '@domain/value-objects/resevation-item';
import { AllItemsAlreadyReturnedError } from '@usecase/@errors/all-items-already-returned-error';
import { ResourceNotFoundError } from '@usecase/@errors/resource-not-found-error';
import { ReturnAllItemsFromReservationUseCase } from './return-all-items-from-reservation';
import { createFakeReservation } from 'test/factories/fake-reservation-factory';
import { ReservationsMockRepository } from '@mocks/mock-reservations-repository';
import { BooksMockRepository } from '@mocks/mock-books-repository';

let reservationsRepository: ReturnType<typeof ReservationsMockRepository>;
let booksRepository: ReturnType<typeof BooksMockRepository>;

describe('[UT] - Return all items from a reservation use case', () => {
    beforeEach(() => {
        reservationsRepository = ReservationsMockRepository();
        booksRepository = BooksMockRepository();
    });

    it('should return all items from reservation', async () => {
        const reservation = createFakeReservation();
        reservationsRepository.findById.mockResolvedValue(reservation);

        const returnAllItemsFromReservation =
            new ReturnAllItemsFromReservationUseCase(
                reservationsRepository,
                booksRepository,
            );

        const result = await returnAllItemsFromReservation.execute({
            id: reservation.id.toString(),
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
                    alreadyExtendTime:
                        reservation.reservationItem[0].alreadyExtendTime,
                    returned: true,
                    returnDate: expect.any(Date),
                }),
            ],
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
        });
    });

    it('should return a message error when reservation is not found', async () => {
        const returnAllItemsFromReservation =
            new ReturnAllItemsFromReservationUseCase(
                reservationsRepository,
                booksRepository,
            );

        const result = await returnAllItemsFromReservation.execute({ id: '1' });

        expect(result.isLeft()).toBeTruthy();
        expect(result.value).toBeInstanceOf(ResourceNotFoundError);
    });

    it('should not extend the reservation when all items were returned', async () => {
        const reservation = createFakeReservation({
            reservationItem: [
                new ReservationItem('1', 'Book 1', new Date(), false, true),
                new ReservationItem('2', 'Book 2', new Date(), false, true),
            ],
        });

        reservationsRepository.findById.mockResolvedValue(reservation);

        const returnAllItemsFromReservation =
            new ReturnAllItemsFromReservationUseCase(
                reservationsRepository,
                booksRepository,
            );

        reservationsRepository.findItemById.mockResolvedValue(reservation);

        const result = await returnAllItemsFromReservation.execute({
            id: reservation.id.toString(),
        });

        expect(result.isLeft()).toBeTruthy();
        expect(result.value).toBeInstanceOf(AllItemsAlreadyReturnedError);
    });
});
