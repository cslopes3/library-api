import { Publisher } from '@domain/entities/publisher';
import { FindManyPublishersUseCase } from './find-many-publishers';

const publisher: Publisher[] = [];

publisher.push(new Publisher({ name: 'Name 1' }, '1', new Date(2023, 0, 1)));
publisher.push(new Publisher({ name: 'Name 2' }, '2', new Date(2023, 0, 10)));
publisher.push(new Publisher({ name: 'Name 3' }, '3', new Date(2023, 0, 20)));

const MockRepository = () => {
    return {
        findById: vi.fn(),
        findMany: vi.fn().mockReturnValue(Promise.resolve(publisher)),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    };
};

describe('[UT] - Find many publishers use case', () => {
    it('should find many publishers', async () => {
        const publishersRepository = MockRepository();
        const findManyPublishersUseCase = new FindManyPublishersUseCase(
            publishersRepository,
        );

        const result = await findManyPublishersUseCase.execute({
            params: {
                page: 1,
            },
        });

        expect(result.isRight()).toBe(true);
        expect(result.value).toHaveLength(3);
        expect(result.value).toEqual([
            expect.objectContaining({
                name: 'Name 1',
                createdAt: new Date(2023, 0, 1),
            }),
            expect.objectContaining({
                name: 'Name 2',
                createdAt: new Date(2023, 0, 10),
            }),
            expect.objectContaining({
                name: 'Name 3',
                createdAt: new Date(2023, 0, 20),
            }),
        ]);
    });

    it('should return an empty array when not found a publisher', async () => {
        const publishersRepository = MockRepository();
        publishersRepository.findMany.mockReturnValue(Promise.resolve([]));

        const findManyPublishersUseCase = new FindManyPublishersUseCase(
            publishersRepository,
        );

        const result = await findManyPublishersUseCase.execute({
            params: {
                page: 2,
            },
        });

        expect(result.isRight()).toBe(true);
        expect(result.value).toHaveLength(0);
    });
});
