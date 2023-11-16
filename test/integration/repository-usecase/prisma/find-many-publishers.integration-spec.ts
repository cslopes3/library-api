import { PrismaService } from '@infra/database/prisma/prisma.service';
import { PrismaPublishersRepository } from '@infra/database/prisma/repositories/prisma-publishers-repository';
import { FindManyPublishersUseCase } from '@usecase/find-many-publishers/find-many-publishers';
import {
    startEnvironment,
    stopEnvironment,
} from 'test/utils/test-environment-setup';

let prisma: PrismaService;
let publishersRepository: PrismaPublishersRepository;
let findManyPublishersUseCase: FindManyPublishersUseCase;

describe('[IT] - Find many publishers', () => {
    beforeEach(() => {
        prisma = new PrismaService();
        startEnvironment();
        publishersRepository = new PrismaPublishersRepository(prisma);
        findManyPublishersUseCase = new FindManyPublishersUseCase(
            publishersRepository,
        );
    });

    afterEach(async () => {
        await stopEnvironment(prisma);
    });

    it('should find many publishers', async () => {
        await prisma.publisher.createMany({
            data: [
                {
                    id: '1',
                    name: 'Publisher 1',
                },
                {
                    id: '2',
                    name: 'Publisher 2',
                },
            ],
        });

        const result = await findManyPublishersUseCase.execute({
            params: {
                page: 1,
            },
        });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toHaveLength(2);
    });

    it('should return an empty array when not found a book', async () => {
        const result = await findManyPublishersUseCase.execute({
            params: { page: 1 },
        });

        expect(result.isRight()).toBeTruthy();
        expect(result.value).toHaveLength(0);
    });
});
