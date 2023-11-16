import { ResourceNotFoundError } from '@usecase/@errors/resource-not-found-error';
import { DeletePublisherUseCase } from './delete-publisher';
import { PublishersMockRepository } from '@mocks/mock-publishers-repository';
import { FakePublisherFactory } from 'test/factories/fake-publisher-factory';

let publishersRepository: ReturnType<typeof PublishersMockRepository>;

describe('[UT] - Delete publisher use case', () => {
    beforeEach(() => {
        publishersRepository = PublishersMockRepository();
    });

    it('should delete publisher', async () => {
        const publisher = FakePublisherFactory.create();
        publishersRepository.findById.mockResolvedValue(publisher);

        const deletePublisherUseCase = new DeletePublisherUseCase(
            publishersRepository,
        );

        const result = await deletePublisherUseCase.execute({
            id: publisher.id.toString(),
        });

        expect(result.isRight()).toBeTruthy();
    });

    it('should return error when publisher is not found', async () => {
        const publisher = FakePublisherFactory.create();
        const deletePublisherUseCase = new DeletePublisherUseCase(
            publishersRepository,
        );

        const result = await deletePublisherUseCase.execute({
            id: publisher.id.toString(),
        });

        expect(result.isLeft()).toBeTruthy();
        expect(result.value).toBeInstanceOf(ResourceNotFoundError);
    });
});
