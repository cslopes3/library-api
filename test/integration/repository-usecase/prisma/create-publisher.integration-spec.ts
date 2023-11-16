import { PrismaService } from '@infra/database/prisma/prisma.service';
import { PrismaPublishersRepository } from '@infra/database/prisma/repositories/prisma-publishers-repository';
import { CreatePublisherUseCase } from '@usecase/create-publisher/create-publisher';
import {
    startEnvironment,
    stopEnvironment,
} from 'test/utils/test-environment-setup';

let prisma: PrismaService;
let publishersRepository: PrismaPublishersRepository;
let createPublisherUseCase: CreatePublisherUseCase;

describe('[IT] - Create publisher', () => {
    beforeEach(() => {
        prisma = new PrismaService();
        startEnvironment();
        publishersRepository = new PrismaPublishersRepository(prisma);
        createPublisherUseCase = new CreatePublisherUseCase(
            publishersRepository,
        );
    });

    afterEach(async () => {
        await stopEnvironment(prisma);
    });

    it('should create a publisher', async () => {
        const publisherName = 'Publisher 1';

        const result = await createPublisherUseCase.execute({
            name: publisherName,
        });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toMatchObject({
            id: expect.any(String),
            name: publisherName,
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
        });
    });
});
