import { ReservationItem } from '@domain/value-objects/resevation-item';
import { AllItemsAlreadyReturnedError } from '@usecase/@errors/all-items-already-returned-error';
import { ResourceNotFoundError } from '@usecase/@errors/resource-not-found-error';
import { ReturnByItemIdUseCase } from './return-by-item-id';

const reservationItem = new ReservationItem(
    '1',
    'Book 1',
    new Date(),
    false,
    false,
    '1',
);

const ReservationsMockRepository = () => {
    return {
        findById: vi.fn(),
        findByUserId: vi.fn(),
        delete: vi.fn(),
        create: vi.fn(),
        changeReservationInfoById: vi.fn(),
        returnByItemId: vi.fn(),
        findItemById: vi.fn().mockReturnValue(Promise.resolve(reservationItem)),
    };
};

const BooksMockRepository = () => {
    return {
        findById: vi.fn(),
        findByName: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        addBookToStock: vi.fn(),
        removeBookFromStock: vi.fn(),
    };
};

describe('[UT] - Return by item id use case', () => {
    it('should return an item', async () => {
        const reservationsRepository = ReservationsMockRepository();
        const booksRepository = BooksMockRepository();
        const returnByItemIdUseCase = new ReturnByItemIdUseCase(
            reservationsRepository,
            booksRepository,
        );

        vi.spyOn(booksRepository, 'addBookToStock');
        vi.spyOn(reservationsRepository, 'returnByItemId');

        const result = await returnByItemIdUseCase.execute({ id: '1' });

        expect(result.isRight()).toBe(true);
        expect(result.value).toEqual({
            id: reservationItem.id.toString(),
            bookId: reservationItem.bookId,
            name: reservationItem.name,
            expirationDate: reservationItem.expirationDate,
            alreadyExtendTime: reservationItem.alreadyExtendTime,
            returned: reservationItem.returned,
            returnDate: expect.any(Date),
        });
        expect(booksRepository.addBookToStock).toHaveBeenCalledWith('1', 1);
        expect(reservationsRepository.returnByItemId).toHaveBeenCalledWith(
            '1',
            expect.any(Date),
        );
    });

    it('should return a message error when item is not found', async () => {
        const reservationsRepository = ReservationsMockRepository();
        const booksRepository = BooksMockRepository();

        const returnByItemIdUseCase = new ReturnByItemIdUseCase(
            reservationsRepository,
            booksRepository,
        );

        reservationsRepository.findItemById.mockReturnValue(
            Promise.resolve(null),
        );

        const result = await returnByItemIdUseCase.execute({ id: '1' });

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(ResourceNotFoundError);
    });

    it('should not extend the reservation when item was returned', async () => {
        const reservationsRepository = ReservationsMockRepository();
        const booksRepository = BooksMockRepository();

        const returnByItemIdUseCase = new ReturnByItemIdUseCase(
            reservationsRepository,
            booksRepository,
        );

        const reservationItem = new ReservationItem(
            '1',
            'Book 1',
            new Date(),
            false,
            true,
            '1',
        );

        reservationsRepository.findItemById.mockReturnValue(
            Promise.resolve(reservationItem),
        );

        const result = await returnByItemIdUseCase.execute({ id: '1' });

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(AllItemsAlreadyReturnedError);
    });
});
