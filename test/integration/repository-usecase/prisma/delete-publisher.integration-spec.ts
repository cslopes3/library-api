import { PrismaService } from '@infra/database/prisma/prisma.service';
import { PrismaPublishersRepository } from '@infra/database/prisma/repositories/prisma-publishers-repository';
import { DeletePublisherUseCase } from '@usecase/delete-publisher/delete-publisher';
import { PrismaFakePublisher } from 'test/factories/fake-publisher-factory';
import {
    startEnvironment,
    stopEnvironment,
} from 'test/utils/test-environment-setup';

let prisma: PrismaService;
let publishersRepository: PrismaPublishersRepository;
let deletePublisherUseCase: DeletePublisherUseCase;
let prismaFakePublisher: PrismaFakePublisher;

describe('[IT] - Delete publisher ', () => {
    beforeEach(() => {
        prisma = new PrismaService();
        startEnvironment();
        publishersRepository = new PrismaPublishersRepository(prisma);
        deletePublisherUseCase = new DeletePublisherUseCase(
            publishersRepository,
        );
        prismaFakePublisher = new PrismaFakePublisher(prisma);
    });

    afterEach(async () => {
        await stopEnvironment(prisma);
    });

    it('should delete publisher', async () => {
        const publisher = await prismaFakePublisher.create();

        const result = await deletePublisherUseCase.execute({
            id: publisher.id.toString(),
        });

        expect(result.isRight()).toBeTruthy();
    });
});
