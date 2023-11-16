import { ResourceNotFoundError } from '@usecase/@errors/resource-not-found-error';
import { ConfirmOrChangeScheduleStatusUseCase } from './confirm-or-change-schedule-status';
import { CantChangeStatusError } from '@usecase/@errors/cant-change-status-error';
import { SchedulesMockRepository } from '@mocks/mock-schedules-repository';
import { ReservationsMockRepository } from '@mocks/mock-reservations-repository';
import { BooksMockRepository } from '@mocks/mock-books-repository';
import { FakeScheduleFactory } from 'test/factories/fake-schedule-factory';
import { ScheduleStatus } from '@domain/entities/schedule';

let schedulesRepository: ReturnType<typeof SchedulesMockRepository>;
let reservationsRepository: ReturnType<typeof ReservationsMockRepository>;
let booksRepository: ReturnType<typeof BooksMockRepository>;

describe('[UT] - Confirm or change schedule status', () => {
    beforeEach(() => {
        schedulesRepository = SchedulesMockRepository();
        reservationsRepository = ReservationsMockRepository();
        booksRepository = BooksMockRepository();
    });

    it('should be able to change status', async () => {
        const schedule = FakeScheduleFactory.create();

        reservationsRepository.findByUserId.mockResolvedValue([]);
        schedulesRepository.findById.mockResolvedValue(schedule);

        vi.spyOn(booksRepository, 'addBookToStock');

        const confirmOrChangeScheduleStatusUseCase =
            new ConfirmOrChangeScheduleStatusUseCase(
                schedulesRepository,
                reservationsRepository,
                booksRepository,
            );

        const result = await confirmOrChangeScheduleStatusUseCase.execute({
            id: schedule.id.toString(),
            status: 'canceled',
        });

        expect(result.isRight()).toBeTruthy();
        expect(booksRepository.addBookToStock).toHaveBeenCalledOnce();
    });

    it('should not be able to change status if it is not pending', async () => {
        const notPendingSchedule = FakeScheduleFactory.create({
            status: ScheduleStatus.canceled,
        });

        reservationsRepository.findByUserId.mockResolvedValue([]);
        schedulesRepository.findById.mockResolvedValue(notPendingSchedule);

        const confirmOrChangeScheduleStatusUseCase =
            new ConfirmOrChangeScheduleStatusUseCase(
                schedulesRepository,
                reservationsRepository,
                booksRepository,
            );

        const result = await confirmOrChangeScheduleStatusUseCase.execute({
            id: notPendingSchedule.id.toString(),
            status: 'canceled',
        });

        expect(result.isLeft()).toBeTruthy();
        expect(result.value).toBeInstanceOf(CantChangeStatusError);
    });

    it('should be able to confirm a schedule', async () => {
        const schedule = FakeScheduleFactory.create();

        reservationsRepository.findByUserId.mockResolvedValue([]);
        schedulesRepository.findById.mockResolvedValue(schedule);

        const confirmOrChangeScheduleStatusUseCase =
            new ConfirmOrChangeScheduleStatusUseCase(
                schedulesRepository,
                reservationsRepository,
                booksRepository,
            );

        vi.spyOn(reservationsRepository, 'create');

        const result = await confirmOrChangeScheduleStatusUseCase.execute({
            id: schedule.id.toString(),
            status: 'finished',
        });

        expect(result.isRight()).toBeTruthy();
        expect(reservationsRepository.create).toHaveBeenCalledWith(
            expect.objectContaining({
                userId: schedule.userId,
                reservationItem: [
                    expect.objectContaining({
                        bookId: schedule.scheduleItems[0].bookId,
                        name: schedule.scheduleItems[0].name,
                        expirationDate: expect.any(Date),
                    }),
                ],
            }),
        );
    });

    it('should return error when schedule is not found', async () => {
        reservationsRepository.findByUserId.mockResolvedValue([]);

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

        expect(result.isLeft()).toBeTruthy();
        expect(result.value).toBeInstanceOf(ResourceNotFoundError);
    });
});
