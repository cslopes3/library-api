import { Schedule, ScheduleStatus } from '@domain/entities/schedule';
import { ScheduleItem } from '@domain/value-objects/schedule-item';
import { ResourceNotFoundError } from '@usecase/@errors/resource-not-found-error';
import { FindReservationScheduleByIdUseCase } from './find-reservation-schedule-by-id';

const schedule = new Schedule(
    {
        date: new Date(),
        userId: '1',
        scheduleItems: [new ScheduleItem('1', 'Book 1')],
        status: ScheduleStatus.pending,
    },
    '1',
);

const MockRepository = () => {
    return {
        create: vi.fn(),
        findById: vi.fn().mockReturnValue(Promise.resolve(schedule)),
        findByUserIdAndLastDays: vi.fn(),
        changeStatus: vi.fn(),
    };
};

describe('[UT] - Find reservation schedule by id', () => {
    it('should find a reservation schedule by id', async () => {
        const schedulesRepository = MockRepository();
        const findReservationScheduleById =
            new FindReservationScheduleByIdUseCase(schedulesRepository);

        const result = await findReservationScheduleById.execute({ id: '1' });

        expect(result.isRight()).toBe(true);
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

    it('should return a message error when schedule is not found', async () => {
        const schedulesRepository = MockRepository();

        schedulesRepository.findById.mockReturnValue(Promise.resolve(null));

        const findReservationScheduleById =
            new FindReservationScheduleByIdUseCase(schedulesRepository);

        const result = await findReservationScheduleById.execute({ id: '1' });

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(ResourceNotFoundError);
    });
});
