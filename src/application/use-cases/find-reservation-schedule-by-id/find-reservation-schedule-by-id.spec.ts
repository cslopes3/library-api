import { FindReservationScheduleByIdUseCase } from './find-reservation-schedule-by-id';
import { SchedulesMockRepository } from '@mocks/mock-schedules-repository';
import { UsersMockRepository } from '@mocks/mock-users-repository';
import { UserRole } from '@shared/utils/user-role';
import { NotAllowedError } from '@usecase/@errors/not-allowed-error';
import { createFakeSchedule } from 'test/factories/fake-schedule-factory';
import { createFakeUser } from 'test/factories/fake-user-factory';

let schedulesRepository: ReturnType<typeof SchedulesMockRepository>;
let usersRepository: ReturnType<typeof UsersMockRepository>;

describe('[UT] - Find reservation schedule by id', () => {
    beforeEach(() => {
        schedulesRepository = SchedulesMockRepository();
        usersRepository = UsersMockRepository();
    });

    it('should find a reservation schedule by id', async () => {
        const user = createFakeUser();
        const schedule = createFakeSchedule();

        schedulesRepository.findById.mockResolvedValue(schedule);
        usersRepository.findById.mockResolvedValue(user);

        const findReservationScheduleById =
            new FindReservationScheduleByIdUseCase(
                schedulesRepository,
                usersRepository,
            );

        const result = await findReservationScheduleById.execute({
            id: schedule.id.toString(),
            currentUserId: schedule.userId,
        });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toEqual({
            id: expect.any(String),
            date: schedule.date,
            userId: schedule.userId,
            scheduleItems: [
                expect.objectContaining({
                    id: expect.any(String),
                    bookId: schedule.scheduleItems[0].bookId,
                    name: schedule.scheduleItems[0].name,
                }),
            ],
            status: expect.any(String),
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
        });
    });

    it('should return null when schedule is not found', async () => {
        const findReservationScheduleById =
            new FindReservationScheduleByIdUseCase(
                schedulesRepository,
                usersRepository,
            );

        const result = await findReservationScheduleById.execute({
            id: '1',
            currentUserId: '1',
        });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toBeNull();
    });

    it('should return error when user is not the admin or the owner', async () => {
        const user = createFakeUser({ role: 'user' as UserRole });
        const currentUser = createFakeUser({ role: 'user' as UserRole });
        const schedule = createFakeSchedule({
            userId: user.id.toString(),
        });

        schedulesRepository.findById.mockResolvedValue(schedule);
        usersRepository.findById.mockResolvedValue(currentUser);

        const findReservationScheduleById =
            new FindReservationScheduleByIdUseCase(
                schedulesRepository,
                usersRepository,
            );

        const result = await findReservationScheduleById.execute({
            id: schedule.id.toString(),
            currentUserId: currentUser.id.toString(),
        });

        expect(result.isLeft()).toBeTruthy();
        expect(result.value).toBeInstanceOf(NotAllowedError);
    });
});
