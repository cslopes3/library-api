import { PrismaService } from '@infra/database/prisma/prisma.service';
import { PrismaPublishersRepository } from '@infra/database/prisma/repositories/prisma-publishers-repository';
import { FindPublisherByIdUseCase } from '@usecase/find-publisher-by-id/find-publisher-by-id';
import { PrismaFakePublisher } from 'test/factories/fake-publisher-factory';
import {
    startEnvironment,
    stopEnvironment,
} from 'test/utils/test-environment-setup';

let prisma: PrismaService;
let publishersRepository: PrismaPublishersRepository;
let findPublisherByIdUseCase: FindPublisherByIdUseCase;
let prismaFakePublisher: PrismaFakePublisher;

describe('[IT] - Find publisher by id', () => {
    beforeEach(() => {
        prisma = new PrismaService();
        startEnvironment();
        publishersRepository = new PrismaPublishersRepository(prisma);
        findPublisherByIdUseCase = new FindPublisherByIdUseCase(
            publishersRepository,
        );
        prismaFakePublisher = new PrismaFakePublisher(prisma);
    });

    afterEach(async () => {
        await stopEnvironment(prisma);
    });

    it('should find a publisher', async () => {
        const publisher = await prismaFakePublisher.create();

        const result = await findPublisherByIdUseCase.execute({
            id: publisher.id.toString(),
        });

        expect(result.isRight()).toBeTruthy();
        expect(result.value?.name).toBe('Publisher 1');
    });

    it('should return null when a publisher is not find', async () => {
        const result = await findPublisherByIdUseCase.execute({ id: '1' });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toBeNull();
    });
});
