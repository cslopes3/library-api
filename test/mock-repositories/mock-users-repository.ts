export const UsersMockRepository = () => {
    return {
        findById: vi.fn(),
        findByEmail: vi.fn(),
        create: vi.fn(),
    };
};
