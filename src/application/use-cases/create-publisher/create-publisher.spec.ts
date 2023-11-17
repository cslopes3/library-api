import { PublishersMockRepository } from '@mocks/mock-publishers-repository';
import { CreatePublisherUseCase } from './create-publisher';
import { PublisherAlreadyExistsError } from '@usecase/@errors/publisher-already-exists-error';
import { createFakePublisher } from 'test/factories/fake-publisher-factory';

let publishersRepository: ReturnType<typeof PublishersMockRepository>;

describe('[UT] - Create publisher use case', () => {
    beforeEach(() => {
        publishersRepository = PublishersMockRepository();
    });

    it('should create a publisher', async () => {
        const publisher = createFakePublisher();

        const createPublisherUseCase = new CreatePublisherUseCase(
            publishersRepository,
        );

        const result = await createPublisherUseCase.execute({
            name: publisher.name,
        });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toMatchObject({
            id: expect.any(String),
            name: publisher.name,
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
        });
    });

    it('should return a message error when publisher already exists', async () => {
        const publisher = createFakePublisher();

        publishersRepository.findByName.mockResolvedValue(publisher);

        const createPublisherUseCase = new CreatePublisherUseCase(
            publishersRepository,
        );

        const result = await createPublisherUseCase.execute({
            name: publisher.name,
        });

        expect(result.isLeft()).toBeTruthy();
        expect(result.value).toBeInstanceOf(PublisherAlreadyExistsError);
    });
});
