import { ResourceNotFoundError } from '@usecase/@errors/resource-not-found-error';
import { ConfirmOrChangeScheduleStatusUseCase } from './confirm-or-change-schedule-status';
import { CantChangeStatusError } from '@usecase/@errors/cant-change-status-error';
import { SchedulesMockRepository } from '@mocks/mock-schedules-repository';
import { ReservationsMockRepository } from '@mocks/mock-reservations-repository';
import { BooksMockRepository } from '@mocks/mock-books-repository';
import { createFakeSchedule } from 'test/factories/fake-schedule-factory';
import { ScheduleStatus } from '@domain/entities/schedule';
import { UsersMockRepository } from '@mocks/mock-users-repository';
import { createFakeUser } from 'test/factories/fake-user-factory';
import { UserRole } from '@shared/utils/user-role';
import { NotAllowedError } from '@usecase/@errors/not-allowed-error';

let schedulesRepository: ReturnType<typeof SchedulesMockRepository>;
let reservationsRepository: ReturnType<typeof ReservationsMockRepository>;
let booksRepository: ReturnType<typeof BooksMockRepository>;
let usersRepository: ReturnType<typeof UsersMockRepository>;

describe('[UT] - Confirm or change schedule status', () => {
    beforeEach(() => {
        schedulesRepository = SchedulesMockRepository();
        reservationsRepository = ReservationsMockRepository();
        booksRepository = BooksMockRepository();
        usersRepository = UsersMockRepository();
    });

    it('should be able to change status', async () => {
        const user = createFakeUser();
        const schedule = createFakeSchedule({ userId: user.id.toString() });

        reservationsRepository.findByUserId.mockResolvedValue([]);
        schedulesRepository.findById.mockResolvedValue(schedule);
        usersRepository.findById.mockResolvedValue(user);

        vi.spyOn(booksRepository, 'addBookToStock');

        const confirmOrChangeScheduleStatusUseCase =
            new ConfirmOrChangeScheduleStatusUseCase(
                schedulesRepository,
                reservationsRepository,
                booksRepository,
                usersRepository,
            );

        const result = await confirmOrChangeScheduleStatusUseCase.execute({
            id: schedule.id.toString(),
            status: 'canceled',
            currentUserId: schedule.userId,
        });

        expect(result.isRight()).toBeTruthy();
        expect(booksRepository.addBookToStock).toHaveBeenCalledOnce();
    });

    it('should not be able to change status if it is not pending', async () => {
        const user = createFakeUser();
        const notPendingSchedule = createFakeSchedule({
            userId: user.id.toString(),
            status: ScheduleStatus.canceled,
        });

        reservationsRepository.findByUserId.mockResolvedValue([]);
        schedulesRepository.findById.mockResolvedValue(notPendingSchedule);
        usersRepository.findById.mockResolvedValue(user);

        const confirmOrChangeScheduleStatusUseCase =
            new ConfirmOrChangeScheduleStatusUseCase(
                schedulesRepository,
                reservationsRepository,
                booksRepository,
                usersRepository,
            );

        const result = await confirmOrChangeScheduleStatusUseCase.execute({
            id: notPendingSchedule.id.toString(),
            status: 'canceled',
            currentUserId: notPendingSchedule.userId,
        });

        expect(result.isLeft()).toBeTruthy();
        expect(result.value).toBeInstanceOf(CantChangeStatusError);
    });

    it('should be able to confirm a schedule', async () => {
        const user = createFakeUser();
        const schedule = createFakeSchedule({ userId: user.id.toString() });

        reservationsRepository.findByUserId.mockResolvedValue([]);
        schedulesRepository.findById.mockResolvedValue(schedule);
        usersRepository.findById.mockResolvedValue(user);

        const confirmOrChangeScheduleStatusUseCase =
            new ConfirmOrChangeScheduleStatusUseCase(
                schedulesRepository,
                reservationsRepository,
                booksRepository,
                usersRepository,
            );

        vi.spyOn(reservationsRepository, 'create');

        const result = await confirmOrChangeScheduleStatusUseCase.execute({
            id: schedule.id.toString(),
            status: 'finished',
            currentUserId: schedule.userId,
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
                usersRepository,
            );

        const result = await confirmOrChangeScheduleStatusUseCase.execute({
            id: '1',
            status: 'finished',
            currentUserId: '1',
        });

        expect(result.isLeft()).toBeTruthy();
        expect(result.value).toBeInstanceOf(ResourceNotFoundError);
    });

    it('should return error when user is not the admin or the owner', async () => {
        const user = createFakeUser({ role: 'user' as UserRole });
        const currentUser = createFakeUser({ role: 'user' as UserRole });
        const schedule = createFakeSchedule({ userId: user.id.toString() });

        reservationsRepository.findByUserId.mockResolvedValue([]);
        usersRepository.findById.mockResolvedValue(currentUser);
        schedulesRepository.findById.mockResolvedValue(schedule);

        const confirmOrChangeScheduleStatusUseCase =
            new ConfirmOrChangeScheduleStatusUseCase(
                schedulesRepository,
                reservationsRepository,
                booksRepository,
                usersRepository,
            );

        const result = await confirmOrChangeScheduleStatusUseCase.execute({
            id: schedule.id.toString(),
            status: 'finished',
            currentUserId: currentUser.id.toString(),
        });

        expect(result.isLeft()).toBeTruthy();
        expect(result.value).toBeInstanceOf(NotAllowedError);
    });
});
