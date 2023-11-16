import { ResourceNotFoundError } from '@usecase/@errors/resource-not-found-error';
import { UpdatePublisherUseCase } from './update-publisher';
import { PublisherAlreadyExistsError } from '@usecase/@errors/publisher-already-exists-error';
import { PublishersMockRepository } from '@mocks/mock-publishers-repository';
import { FakePublisherFactory } from 'test/factories/fake-publisher-factory';

let publishersRepository: ReturnType<typeof PublishersMockRepository>;

describe('[UT] - Update publisher use case', () => {
    beforeEach(() => {
        publishersRepository = PublishersMockRepository();
    });

    it('should update publisher', async () => {
        const publisher = FakePublisherFactory.create();
        const updatedName = 'Updated Publisher';
        publishersRepository.findById.mockResolvedValue(publisher);

        const updatePublisherUseCase = new UpdatePublisherUseCase(
            publishersRepository,
        );

        const result = await updatePublisherUseCase.execute({
            id: publisher.id.toString(),
            name: updatedName,
        });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toMatchObject({
            id: publisher.id.toString(),
            name: updatedName,
            createdAt: publisher.createdAt,
            updatedAt: expect.any(Date),
        });
    });

    it('should return error when publisher is not found', async () => {
        const publisher = FakePublisherFactory.create();
        const updatedName = 'Updated Publisher';

        const updatePublisherUseCase = new UpdatePublisherUseCase(
            publishersRepository,
        );

        const result = await updatePublisherUseCase.execute({
            id: publisher.id.toString(),
            name: updatedName,
        });

        expect(result.isLeft()).toBeTruthy();
        expect(result.value).toBeInstanceOf(ResourceNotFoundError);
    });

    it('should return a message error when publisher already exists', async () => {
        const publisher = FakePublisherFactory.create();
        const publisherWithSameName = FakePublisherFactory.create({}, '2');

        publishersRepository.findById.mockResolvedValue(publisher);
        publishersRepository.findByName.mockResolvedValue(
            publisherWithSameName,
        );

        const updatePublisherUseCase = new UpdatePublisherUseCase(
            publishersRepository,
        );

        const result = await updatePublisherUseCase.execute({
            id: publisherWithSameName.id.toString(),
            name: publisherWithSameName.name,
        });

        expect(result.isLeft()).toBeTruthy();
        expect(result.value).toBeInstanceOf(PublisherAlreadyExistsError);
    });
});
