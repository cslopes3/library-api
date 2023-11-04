import { Reservation } from '@domain/entities/reservation';
import { DeleteReservationUseCase } from './delete-reservation';
import { ReservationItem } from '@domain/value-objects/resevation-item';
import { ResourceNotFoundError } from '@usecase/@errors/resource-not-found-error';

const ReservationMockRepository = () => {
    return {
        findById: vi.fn(),
        findByUserId: vi.fn(),
        delete: vi.fn(),
        create: vi.fn(),
        changeReservationInfoById: vi.fn(),
        returnByItemId: vi.fn(),
        findItemById: vi.fn(),
    };
};

const BookMockRepository = () => {
    return {
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        findById: vi.fn(),
        findByName: vi.fn(),
        findMany: vi.fn(),
        addBookToStock: vi.fn(),
        removeBookFromStock: vi.fn(),
    };
};

describe('[UT] - Delete reservation use case', () => {
    it('should delete a reservation', async () => {
        const reservationsRepository = ReservationMockRepository();
        const booksRepository = BookMockRepository();
        const deleteReservationUseCase = new DeleteReservationUseCase(
            reservationsRepository,
            booksRepository,
        );

        const reservation = new Reservation(
            {
                userId: '1',
                reservationItem: [
                    new ReservationItem(
                        '1',
                        'Book 1',
                        new Date(),
                        false,
                        false,
                    ),
                ],
            },
            '1',
        );

        reservationsRepository.findById.mockReturnValue(
            Promise.resolve(reservation),
        );

        const result = await deleteReservationUseCase.execute({ id: '1' });

        expect(result.isRight()).toBe(true);
    });

    it('should return error when reservation is not found', async () => {
        const reservationsRepository = ReservationMockRepository();
        const booksRepository = BookMockRepository();
        reservationsRepository.findById.mockReturnValue(Promise.resolve(null));

        const deleteReservationUseCase = new DeleteReservationUseCase(
            reservationsRepository,
            booksRepository,
        );

        const result = await deleteReservationUseCase.execute({
            id: '1',
        });

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(ResourceNotFoundError);
    });
});
