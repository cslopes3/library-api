import { PrismaService } from '@infra/database/prisma/prisma.service';
import { PrismaPublishersRepository } from '@infra/database/prisma/repositories/prisma-publishers-repository';
import { DeletePublisherUseCase } from '@usecase/delete-publisher/delete-publisher';
import {
    startEnvironment,
    stopEnvironment,
} from 'test/utils/test-environment-setup';

let prisma: PrismaService;
let publishersRepository: PrismaPublishersRepository;
let deletePublisherUseCase: DeletePublisherUseCase;

describe('[IT] - Delete publisher ', () => {
    beforeEach(() => {
        prisma = new PrismaService();
        startEnvironment();
        publishersRepository = new PrismaPublishersRepository(prisma);
        deletePublisherUseCase = new DeletePublisherUseCase(
            publishersRepository,
        );
    });

    afterEach(async () => {
        await stopEnvironment(prisma);
    });

    it('should delete publisher', async () => {
        await prisma.publisher.create({
            data: {
                id: '1',
                name: 'Publisher 1',
            },
        });

        const result = await deletePublisherUseCase.execute({
            id: '1',
        });

        expect(result.isRight()).toBeTruthy();
    });
});
