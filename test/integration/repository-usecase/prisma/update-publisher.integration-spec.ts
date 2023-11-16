import { PrismaService } from '@infra/database/prisma/prisma.service';
import { PrismaPublishersRepository } from '@infra/database/prisma/repositories/prisma-publishers-repository';
import { UpdatePublisherUseCase } from '@usecase/update-publisher/update-publisher';
import {
    startEnvironment,
    stopEnvironment,
} from 'test/utils/test-environment-setup';

let prisma: PrismaService;
let publishersRepository: PrismaPublishersRepository;
let updatePublisherUseCase: UpdatePublisherUseCase;

describe('[IT] - Update publisher', () => {
    beforeEach(() => {
        prisma = new PrismaService();
        startEnvironment();
        publishersRepository = new PrismaPublishersRepository(prisma);
        updatePublisherUseCase = new UpdatePublisherUseCase(
            publishersRepository,
        );
    });

    afterEach(async () => {
        await stopEnvironment(prisma);
    });

    it('should update publisher', async () => {
        const publisher = {
            id: '1',
            name: 'Publisher 1',
        };

        await prisma.publisher.create({
            data: publisher,
        });

        const updatedName = 'Updated Publisher';

        const result = await updatePublisherUseCase.execute({
            id: publisher.id.toString(),
            name: updatedName,
        });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toMatchObject({
            id: publisher.id.toString(),
            name: updatedName,
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
        });
    });
});
