import { ReservationItem } from '@domain/value-objects/resevation-item';
import { AllItemsAlreadyReturnedError } from '@usecase/@errors/all-items-already-returned-error';
import { ResourceNotFoundError } from '@usecase/@errors/resource-not-found-error';
import { ReturnByItemIdUseCase } from './return-by-item-id';
import { BooksMockRepository } from '@mocks/mock-books-repository';
import { ReservationsMockRepository } from '@mocks/mock-reservations-repository';

let reservationsRepository: ReturnType<typeof ReservationsMockRepository>;
let booksRepository: ReturnType<typeof BooksMockRepository>;

describe('[UT] - Return by item id use case', () => {
    beforeEach(() => {
        reservationsRepository = ReservationsMockRepository();
        booksRepository = BooksMockRepository();
    });

    it('should return an item', async () => {
        const reservationItem = new ReservationItem(
            '1',
            'Book 1',
            new Date(),
            false,
            false,
            '1',
        );

        reservationsRepository.findItemById.mockResolvedValue(reservationItem);

        const returnByItemIdUseCase = new ReturnByItemIdUseCase(
            reservationsRepository,
            booksRepository,
        );

        vi.spyOn(booksRepository, 'addBookToStock');
        vi.spyOn(reservationsRepository, 'returnByItemId');

        const result = await returnByItemIdUseCase.execute({
            id: reservationItem.id.toString(),
        });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toMatchObject({
            id: reservationItem.id.toString(),
            bookId: reservationItem.bookId,
            name: reservationItem.name,
            expirationDate: reservationItem.expirationDate,
            alreadyExtendTime: reservationItem.alreadyExtendTime,
            returned: true,
            returnDate: expect.any(Date),
        });
        expect(booksRepository.addBookToStock).toHaveBeenCalledWith('1', 1);
        expect(reservationsRepository.returnByItemId).toHaveBeenCalledWith(
            '1',
            expect.any(Date),
        );
    });

    it('should return a message error when item is not found', async () => {
        const returnByItemIdUseCase = new ReturnByItemIdUseCase(
            reservationsRepository,
            booksRepository,
        );

        const result = await returnByItemIdUseCase.execute({ id: '1' });

        expect(result.isLeft()).toBeTruthy();
        expect(result.value).toBeInstanceOf(ResourceNotFoundError);
    });

    it('should not return a message error when item was already returned', async () => {
        const reservationItem = new ReservationItem(
            '1',
            'Book 1',
            new Date(),
            false,
            true,
            '1',
        );

        reservationsRepository.findItemById.mockResolvedValue(reservationItem);

        const returnByItemIdUseCase = new ReturnByItemIdUseCase(
            reservationsRepository,
            booksRepository,
        );

        const result = await returnByItemIdUseCase.execute({
            id: reservationItem.id.toString(),
        });

        expect(result.isLeft()).toBeTruthy();
        expect(result.value).toBeInstanceOf(AllItemsAlreadyReturnedError);
    });
});
