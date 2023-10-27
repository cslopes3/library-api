import { Publisher } from '@domain/entities/publisher';
import { ResourceNotFoundError } from '@usecase/@errors/resource-not-found-error';
import { DeletePublisherUseCase } from './delete-publisher';

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
        update: vi.fn(),
        delete: vi.fn(),
    };
};

describe('[UT] - Delete publisher use case', () => {
    it('should delete publisher', async () => {
        const publishersRepository = MockRepository();
        const deletePublisherUseCase = new DeletePublisherUseCase(
            publishersRepository,
        );

        const result = await deletePublisherUseCase.execute({
            id: publisher.id.toString(),
        });

        expect(result.isRight()).toBe(true);
    });

    it('should return error when publisher is not found', async () => {
        const publishersRepository = MockRepository();
        publishersRepository.findById.mockReturnValue(Promise.resolve(null));

        const deletePublisherUseCase = new DeletePublisherUseCase(
            publishersRepository,
        );

        const result = await deletePublisherUseCase.execute({
            id: publisher.id.toString(),
        });

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(ResourceNotFoundError);
    });
});
