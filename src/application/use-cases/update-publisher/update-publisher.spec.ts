import { Publisher } from '@domain/entities/publisher';
import { ResourceNotFoundError } from '@usecase/@errors/resource-not-found-error';
import { UpdatePublisherUseCase } from './update-publisher';

const publisher = new Publisher(
    {
        name: 'Updated Name',
    },
    '1',
);

const MockRepository = () => {
    return {
        findById: vi.fn().mockReturnValue(Promise.resolve(publisher)),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn().mockReturnValue(Promise.resolve(publisher)),
        delete: vi.fn(),
    };
};

describe('[UT] - Update publisher use case', () => {
    it('should update publisher', async () => {
        const publishersRepository = MockRepository();
        const updatePublisherUseCase = new UpdatePublisherUseCase(
            publishersRepository,
        );

        const result = await updatePublisherUseCase.execute({
            id: '1',
            name: 'Updated Name',
        });

        expect(result.isRight()).toBe(true);
        expect(result.value).toEqual({
            id: publisher.id.toString(),
            name: 'Updated Name',
            createdAt: publisher.createdAt,
            updatedAt: expect.any(Date),
        });
    });

    it('should return error when publisher is not found', async () => {
        const publishersRepository = MockRepository();
        publishersRepository.findById.mockReturnValue(Promise.resolve(null));

        const updatePublisherUseCase = new UpdatePublisherUseCase(
            publishersRepository,
        );

        const result = await updatePublisherUseCase.execute({
            id: '1',
            name: 'Updated Name',
        });

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(ResourceNotFoundError);
    });
});
