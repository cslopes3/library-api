export const ReservationsMockRepository = () => {
    return {
        findById: vi.fn(),
        findByUserId: vi.fn(),
        delete: vi.fn(),
        create: vi.fn(),
        changeReservationInfoById: vi.fn(),
        returnByItemId: vi.fn(),
        findItemById: vi.fn(),
    };
};
