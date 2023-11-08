import { Schedule, ScheduleStatus } from '@domain/entities/schedule';
import { ScheduleItem } from '@domain/value-objects/schedule-item';
import { User } from '@domain/entities/user';
import { UserDoesNotExistsError } from '@usecase/@errors/user-does-not-exists-error';
import { FindLastThirtyScheduleByUserIdUseCase } from './find-last-thirty-days-schedule-by-user-id';

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
        findById: vi.fn(),
        findByUserIdAndLastDays: vi
            .fn()
            .mockReturnValue(Promise.resolve([schedule])),
        changeStatus: vi.fn(),
    };
};

const user = new User(
    {
        name: 'Name 1',
        email: 'email@email.com',
        password: '123456',
    },
    '1',
);

const UsersMockRepository = () => {
    return {
        findById: vi.fn().mockReturnValue(Promise.resolve(user)),
        findByEmail: vi.fn(),
        create: vi.fn(),
    };
};

describe('[UT] - Find last thirty days schedule by user id', () => {
    it('should find a schedule by user id', async () => {
        const schedulesRepository = SchedulesMockRepository();
        const usersRepository = UsersMockRepository();

        const findLastThirtyScheduleByUserIdUseCase =
            new FindLastThirtyScheduleByUserIdUseCase(
                schedulesRepository,
                usersRepository,
            );

        const result = await findLastThirtyScheduleByUserIdUseCase.execute({
            userId: '1',
        });

        expect(result.isRight()).toBe(true);
        expect(result.value).toEqual([
            {
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
            },
        ]);
    });

    it('should return a message error when user is not found', async () => {
        const schedulesRepository = SchedulesMockRepository();
        const usersRepository = UsersMockRepository();

        usersRepository.findById.mockReturnValue(Promise.resolve(null));

        const findLastThirtyScheduleByUserIdUseCase =
            new FindLastThirtyScheduleByUserIdUseCase(
                schedulesRepository,
                usersRepository,
            );

        const result = await findLastThirtyScheduleByUserIdUseCase.execute({
            userId: '1',
        });

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(UserDoesNotExistsError);
    });

    it('should return an empty array when not found a schedule', async () => {
        const schedulesRepository = SchedulesMockRepository();
        const usersRepository = UsersMockRepository();

        schedulesRepository.findByUserIdAndLastDays.mockReturnValue(
            Promise.resolve([]),
        );

        const findLastThirtyScheduleByUserIdUseCase =
            new FindLastThirtyScheduleByUserIdUseCase(
                schedulesRepository,
                usersRepository,
            );

        const result = await findLastThirtyScheduleByUserIdUseCase.execute({
            userId: '1',
        });

        expect(result.isRight()).toBe(true);
        expect(result.value).toHaveLength(0);
    });
});
