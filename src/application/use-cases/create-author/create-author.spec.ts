import { CreateAuthorUseCase } from './create-author';

const MockRepository = () => {
    return {
        findById: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    };
};

describe('[UT] - Create author use case', () => {
    it('should create a author', async () => {
        const authorRepository = MockRepository();
        const createAuthorUseCase = new CreateAuthorUseCase(authorRepository);

        const result = await createAuthorUseCase.execute({
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
