import { Publisher } from '@domain/entities/publisher';
import { CreatePublisherUseCase } from './create-publisher';
import { PublisherAlreadyExistsError } from '@usecase/@errors/publisher-already-exists-error';

const MockRepository = () => {
    return {
        findById: vi.fn(),
        findByName: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    };
};

let createPublisherUseCase: CreatePublisherUseCase;

describe('[UT] - Create publisher use case', () => {
    it('should create a publisher', async () => {
        const publishersRepository = MockRepository();
        createPublisherUseCase = new CreatePublisherUseCase(
            publishersRepository,
        );

        const result = await createPublisherUseCase.execute({
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

    it('should return a message error when publisher already exists', async () => {
        const publisher = new Publisher({
            name: 'Name 1',
        });

        const publishersRepository = MockRepository();
        publishersRepository.findByName.mockReturnValue(
            Promise.resolve(publisher),
        );

        createPublisherUseCase = new CreatePublisherUseCase(
            publishersRepository,
        );

        const result = await createPublisherUseCase.execute({
            name: 'Name 1',
        });

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(PublisherAlreadyExistsError);
    });
});
