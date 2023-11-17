import { UserDoesNotExistsError } from '@usecase/@errors/user-does-not-exists-error';
import { FindLastThirtyScheduleByUserIdUseCase } from './find-last-thirty-days-schedule-by-user-id';
import { SchedulesMockRepository } from '@mocks/mock-schedules-repository';
import { UsersMockRepository } from '@mocks/mock-users-repository';
import { createFakeUser } from 'test/factories/fake-user-factory';
import { createFakeSchedule } from 'test/factories/fake-schedule-factory';

let schedulesRepository: ReturnType<typeof SchedulesMockRepository>;
let usersRepository: ReturnType<typeof UsersMockRepository>;

describe('[UT] - Find last thirty days schedule by user id', () => {
    beforeEach(() => {
        schedulesRepository = SchedulesMockRepository();
        usersRepository = UsersMockRepository();
    });

    it('should find a schedule by user id', async () => {
        const user = createFakeUser();
        const schedule = [
            createFakeSchedule({
                userId: user.id.toString(),
            }),
        ];

        schedulesRepository.findByUserIdAndLastDays.mockResolvedValue(schedule);
        usersRepository.findById.mockResolvedValue(user);

        const findLastThirtyScheduleByUserIdUseCase =
            new FindLastThirtyScheduleByUserIdUseCase(
                schedulesRepository,
                usersRepository,
            );

        const result = await findLastThirtyScheduleByUserIdUseCase.execute({
            userId: user.id.toString(),
        });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toEqual([
            {
                id: expect.any(String),
                date: schedule[0].date,
                userId: schedule[0].userId,
                scheduleItems: [
                    expect.objectContaining({
                        id: expect.any(String),
                        bookId: schedule[0].scheduleItems[0].bookId,
                        name: schedule[0].scheduleItems[0].name,
                    }),
                ],
                status: expect.any(String),
                createdAt: expect.any(Date),
                updatedAt: expect.any(Date),
            },
        ]);
    });

    it('should return a message error when user is not found', async () => {
        const findLastThirtyScheduleByUserIdUseCase =
            new FindLastThirtyScheduleByUserIdUseCase(
                schedulesRepository,
                usersRepository,
            );

        const result = await findLastThirtyScheduleByUserIdUseCase.execute({
            userId: '1',
        });

        expect(result.isLeft()).toBeTruthy();
        expect(result.value).toBeInstanceOf(UserDoesNotExistsError);
    });

    it('should return an empty array when not found a schedule', async () => {
        const user = createFakeUser();

        schedulesRepository.findByUserIdAndLastDays.mockResolvedValue([]);
        usersRepository.findById.mockResolvedValue(user);

        const findLastThirtyScheduleByUserIdUseCase =
            new FindLastThirtyScheduleByUserIdUseCase(
                schedulesRepository,
                usersRepository,
            );

        const result = await findLastThirtyScheduleByUserIdUseCase.execute({
            userId: user.id.toString(),
        });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toHaveLength(0);
    });
});
