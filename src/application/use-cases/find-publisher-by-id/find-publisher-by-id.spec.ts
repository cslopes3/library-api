import { PublishersMockRepository } from '@mocks/mock-publishers-repository';
import { FindPublisherByIdUseCase } from './find-publisher-by-id';
import { FakePublisherFactory } from 'test/factories/fake-publisher-factory';

let publishersRepository: ReturnType<typeof PublishersMockRepository>;

describe('[UT] - Find publisher by id use case', () => {
    beforeEach(() => {
        publishersRepository = PublishersMockRepository();
    });

    it('should find an publisher', async () => {
        const publisher = FakePublisherFactory.create();

        publishersRepository.findById.mockResolvedValue(publisher);

        const findPublisherByIdUseCase = new FindPublisherByIdUseCase(
            publishersRepository,
        );

        const result = await findPublisherByIdUseCase.execute({
            id: publisher.id.toString(),
        });

        expect(result.isRight()).toBeTruthy();
        expect(result.value?.name).toBe(publisher.name);
    });

    it('should return null when a publisher is not find', async () => {
        const findPublisherByIdUseCase = new FindPublisherByIdUseCase(
            publishersRepository,
        );

        const result = await findPublisherByIdUseCase.execute({ id: '1' });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toBeNull();
    });
});
