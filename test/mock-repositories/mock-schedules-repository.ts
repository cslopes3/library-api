export const SchedulesMockRepository = () => {
    return {
        create: vi.fn(),
        findById: vi.fn(),
        findByUserIdAndLastDays: vi.fn(),
        changeStatus: vi.fn(),
    };
};
