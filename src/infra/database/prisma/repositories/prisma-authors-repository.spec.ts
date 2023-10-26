import { Author } from '@domain/entities/author';
import { PrismaAuthorsRepository } from './prisma-authors-repository';
import {
    startEnvironment,
    stopEnvironment,
} from 'test/utils/test-environment-setup';
import { PrismaService } from '../prisma.service';

let prisma: PrismaService;
let authorsRepository: PrismaAuthorsRepository;

describe('[UT] - Authors repository', () => {
    beforeEach(async () => {
        prisma = new PrismaService();
        startEnvironment();
        authorsRepository = new PrismaAuthorsRepository(prisma);
    });

    afterEach(async () => {
        await stopEnvironment(prisma);
    });

    it('should create a author', async () => {
        vi.spyOn(prisma.author, 'create');

        const author = new Author({ name: 'Name 1' });

        await authorsRepository.create(author);

        expect(prisma.author.create).toHaveBeenCalledWith({
            data: {
                id: author.id.toString(),
                name: author.name,
            },
        });
    });

    it('should find many authors', async () => {
        await prisma.author.createMany({
            data: [
                {
                    name: 'Name 1',
                },
                {
                    name: 'Name 2',
                },
            ],
        });

        const result = await authorsRepository.findMany({ page: 1 });

        expect(result).toHaveLength(2);
        expect(result![0].name).toEqual('Name 1');
        expect(result![1].name).toEqual('Name 2');
    });

    it('should return an empty array when not found an author', async () => {
        const result = await authorsRepository.findMany({ page: 1 });

        expect(result).toHaveLength(0);
    });
});
