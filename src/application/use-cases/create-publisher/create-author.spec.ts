import { CreatePublisherUseCase } from './create-publisher';

const MockRepository = () => {
    return {
        findById: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    };
};

describe('[UT] - Create publisher use case', () => {
    it('should create a publisher', async () => {
        const publisherRepository = MockRepository();
        const createPublisherUseCase = new CreatePublisherUseCase(
            publisherRepository,
        );

        const result = await createPublisherUseCase.execute({
            name: 'Name 1',
        });

        expect(result.isRight()).toBe(true);
        expect(result.value).toEqual({
            id: expect.any(String),
            name: 'Name 1',
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
        });
    });
});
