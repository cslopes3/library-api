import { Publisher } from '@domain/entities/publisher';
import { FindPublisherByIdUseCase } from './find-publisher-by-id';

const MockRepository = () => {
    return {
        findById: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    };
};

describe('[UT] - Find publisher by id use case', () => {
    it('should find an publisher', async () => {
        const publishersRepository = MockRepository();

        const publisher = new Publisher(
            {
                name: 'Publisher 1',
            },
            '1',
        );

        publishersRepository.findById.mockReturnValue(
            Promise.resolve(publisher),
        );

        const findPublisherByIdUseCase = new FindPublisherByIdUseCase(
            publishersRepository,
        );

        const result = await findPublisherByIdUseCase.execute({ id: '1' });

        expect(result.isRight()).toBe(true);
        expect(result.value?.name).toBe('Publisher 1');
    });

    it('should return null when a publisher is not find', async () => {
        const publishersRepository = MockRepository();
        publishersRepository.findById.mockReturnValue(Promise.resolve(null));

        const findPublisherByIdUseCase = new FindPublisherByIdUseCase(
            publishersRepository,
        );

        const result = await findPublisherByIdUseCase.execute({ id: '1' });

        expect(result.isRight()).toBe(true);
        expect(result.value).toBeNull();
    });
});
