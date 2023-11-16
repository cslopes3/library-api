import { FindReservationScheduleByIdUseCase } from './find-reservation-schedule-by-id';
import { SchedulesMockRepository } from '@mocks/mock-schedules-repository';
import { FakeScheduleFactory } from 'test/factories/fake-schedule-factory';

let schedulesRepository: ReturnType<typeof SchedulesMockRepository>;

describe('[UT] - Find reservation schedule by id', () => {
    beforeEach(() => {
        schedulesRepository = SchedulesMockRepository();
    });

    it('should find a reservation schedule by id', async () => {
        const schedule = FakeScheduleFactory.create();

        schedulesRepository.findById.mockResolvedValue(schedule);

        const findReservationScheduleById =
            new FindReservationScheduleByIdUseCase(schedulesRepository);

        const result = await findReservationScheduleById.execute({
            id: schedule.id.toString(),
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
            new FindReservationScheduleByIdUseCase(schedulesRepository);

        const result = await findReservationScheduleById.execute({ id: '1' });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toBeNull();
    });
});
