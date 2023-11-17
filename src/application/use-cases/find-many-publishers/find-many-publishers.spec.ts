import { PublishersMockRepository } from '@mocks/mock-publishers-repository';
import { FindManyPublishersUseCase } from './find-many-publishers';
import { createFakePublisher } from 'test/factories/fake-publisher-factory';

let publishersRepository: ReturnType<typeof PublishersMockRepository>;

describe('[UT] - Find many publishers use case', () => {
    beforeEach(() => {
        publishersRepository = PublishersMockRepository();
    });

    it('should find many publishers', async () => {
        const publishers = [
            createFakePublisher(),
            createFakePublisher({ name: 'Publisher 2' }),
            createFakePublisher({ name: 'Publisher 3' }),
        ];

        publishersRepository.findMany.mockResolvedValue(publishers);

        const findManyPublishersUseCase = new FindManyPublishersUseCase(
            publishersRepository,
        );

        const result = await findManyPublishersUseCase.execute({
            params: {
                page: 1,
            },
        });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toHaveLength(3);
        expect(result.value).toEqual([
            expect.objectContaining({
                name: publishers[0].name,
            }),
            expect.objectContaining({
                name: publishers[1].name,
            }),
            expect.objectContaining({
                name: publishers[2].name,
            }),
        ]);
    });

    it('should return an empty array when not found a publisher', async () => {
        publishersRepository.findMany.mockResolvedValue([]);

        const findManyPublishersUseCase = new FindManyPublishersUseCase(
            publishersRepository,
        );

        const result = await findManyPublishersUseCase.execute({
            params: {
                page: 2,
            },
        });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toHaveLength(0);
    });
});
