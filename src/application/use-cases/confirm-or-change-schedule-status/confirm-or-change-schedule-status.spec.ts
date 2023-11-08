import { Schedule, ScheduleStatus } from '@domain/entities/schedule';
import { ScheduleItem } from '@domain/value-objects/schedule-item';
import { ResourceNotFoundError } from '@usecase/@errors/resource-not-found-error';
import { ConfirmOrChangeScheduleStatusUseCase } from './confirm-or-change-schedule-status';
import { CantChangeStatusError } from '@usecase/@errors/cant-change-status-error';

const schedule = new Schedule(
    {
        date: new Date(),
        userId: '1',
        scheduleItems: [new ScheduleItem('1', 'Book 1')],
        status: ScheduleStatus.pending,
    },
    '1',
);

const SchedulesMockRepository = () => {
    return {
        create: vi.fn(),
        findById: vi.fn().mockReturnValue(Promise.resolve(schedule)),
        findByUserIdAndLastDays: vi.fn(),
        changeStatus: vi.fn(),
    };
};

const ReservationsMockRepository = () => {
    return {
        findById: vi.fn(),
        findByUserId: vi.fn().mockReturnValue(Promise.resolve([])),
        delete: vi.fn(),
        create: vi.fn(),
        changeReservationInfoById: vi.fn(),
        returnByItemId: vi.fn(),
        findItemById: vi.fn(),
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

describe('[UT] - Confirm or change schedule status', () => {
    it('should be able to change status', async () => {
        const schedulesRepository = SchedulesMockRepository();
        const reservationsRepository = ReservationsMockRepository();
        const booksRepository = BooksMockRepository();

        vi.spyOn(booksRepository, 'addBookToStock');

        const confirmOrChangeScheduleStatusUseCase =
            new ConfirmOrChangeScheduleStatusUseCase(
                schedulesRepository,
                reservationsRepository,
                booksRepository,
            );

        const result = await confirmOrChangeScheduleStatusUseCase.execute({
            id: '1',
            status: 'canceled',
        });

        expect(result.isRight()).toBe(true);
        expect(booksRepository.addBookToStock).toHaveBeenCalledOnce();
    });

    it('should not be able to change status if it is not pending', async () => {
        const schedulesRepository = SchedulesMockRepository();
        const reservationsRepository = ReservationsMockRepository();
        const booksRepository = BooksMockRepository();

        const notPendingSchedule = new Schedule(
            {
                date: new Date(),
                userId: '1',
                scheduleItems: [new ScheduleItem('1', 'Book 1')],
                status: ScheduleStatus.canceled,
            },
            '1',
        );

        schedulesRepository.findById.mockReturnValue(
            Promise.resolve(notPendingSchedule),
        );

        const confirmOrChangeScheduleStatusUseCase =
            new ConfirmOrChangeScheduleStatusUseCase(
                schedulesRepository,
                reservationsRepository,
                booksRepository,
            );

        const result = await confirmOrChangeScheduleStatusUseCase.execute({
            id: '1',
            status: 'canceled',
        });

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(CantChangeStatusError);
    });

    it('should be able to confirm a schedule', async () => {
        const schedulesRepository = SchedulesMockRepository();
        const reservationsRepository = ReservationsMockRepository();
        const booksRepository = BooksMockRepository();

        const confirmOrChangeScheduleStatusUseCase =
            new ConfirmOrChangeScheduleStatusUseCase(
                schedulesRepository,
                reservationsRepository,
                booksRepository,
            );

        vi.spyOn(reservationsRepository, 'create');

        const result = await confirmOrChangeScheduleStatusUseCase.execute({
            id: '1',
            status: 'finished',
        });

        // const reservation = new Reservation({
        //     userId: schedule.userId,
        //     reservationItem: [
        //         new ReservationItem('1', 'Book 1', new Date(), false, false),
        //     ],
        // });

        expect(result.isRight()).toBe(true);
        expect(reservationsRepository.create).toHaveBeenCalledWith(
            expect.objectContaining({
                userId: schedule.userId,
                reservationItem: [
                    expect.objectContaining({
                        bookId: '1',
                        name: 'Book 1',
                        expirationDate: expect.any(Date),
                    }),
                ],
            }),
        );
    });

    it('should return error when schedule is not found', async () => {
        const schedulesRepository = SchedulesMockRepository();
        const reservationsRepository = ReservationsMockRepository();
        const booksRepository = BooksMockRepository();

        schedulesRepository.findById.mockReturnValue(Promise.resolve(null));

        const confirmOrChangeScheduleStatusUseCase =
            new ConfirmOrChangeScheduleStatusUseCase(
                schedulesRepository,
                reservationsRepository,
                booksRepository,
            );

        const result = await confirmOrChangeScheduleStatusUseCase.execute({
            id: '1',
            status: 'finished',
        });

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(ResourceNotFoundError);
    });
});
