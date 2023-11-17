import { PrismaAuthorsRepository } from './prisma-authors-repository';
import {
    startEnvironment,
    stopEnvironment,
} from 'test/utils/test-environment-setup';
import { PrismaService } from '../prisma.service';
import {
    PrismaFakeAuthor,
    createFakeAuthor,
} from 'test/factories/fake-author-factory';

let prisma: PrismaService;
let authorsRepository: PrismaAuthorsRepository;
let prismaFakeAuthor: PrismaFakeAuthor;

describe('[UT] - Authors repository', () => {
    beforeEach(() => {
        prisma = new PrismaService();
        startEnvironment();
        authorsRepository = new PrismaAuthorsRepository(prisma);
        prismaFakeAuthor = new PrismaFakeAuthor(prisma);
    });

    afterEach(async () => {
        await stopEnvironment(prisma);
    });

    it('should create an author', async () => {
        vi.spyOn(prisma.author, 'create');

        const author = createFakeAuthor();

        await authorsRepository.create(author);

        expect(prisma.author.create).toHaveBeenCalledWith({
            data: {
                id: author.id.toString(),
                name: author.name,
            },
        });
    });

    it('should find many authors', async () => {
        const author = await prismaFakeAuthor.create();
        const author2 = await prismaFakeAuthor.create({ name: 'Author 2' });

        const result = await authorsRepository.findMany({ page: 1 });

        expect(result).toHaveLength(2);
        expect(result![0].name).toEqual(author.name);
        expect(result![1].name).toEqual(author2.name);
    });

    it('should return an empty array when not found an author at findMany', async () => {
        const result = await authorsRepository.findMany({ page: 1 });

        expect(result).toHaveLength(0);
    });

    it('should find an author by id', async () => {
        const author = await prismaFakeAuthor.create();

        const result = await authorsRepository.findById(author.id.toString());

        expect(result?.name).toEqual(author.name);
    });

    it('should return null when not found an author by id', async () => {
        const result = await authorsRepository.findById('1');

        expect(result).toBeNull();
    });

    it('should find an author by name', async () => {
        const author = await prismaFakeAuthor.create();

        const result = await authorsRepository.findByName(author.name);

        expect(result?.name).toEqual(author.name);
    });

    it('should return null when not found an author by name', async () => {
        const result = await authorsRepository.findByName('Author 1');

        expect(result).toBeNull();
    });

    it('should update an author', async () => {
        const updatedName = 'Updated Name';
        const author = await prismaFakeAuthor.create();

        author.changeName(updatedName);

        vi.spyOn(prisma.author, 'update');
        await authorsRepository.update(author);

        expect(prisma.author.update).toHaveBeenCalledWith({
            where: {
                id: author.id.toString(),
            },
            data: {
                id: author.id.toString(),
                name: updatedName,
            },
        });
    });

    it('should delete an author', async () => {
        const author = await prismaFakeAuthor.create();

        vi.spyOn(prisma.author, 'delete');

        await authorsRepository.delete(author.id.toString());

        expect(prisma.author.delete).toHaveBeenCalledWith({
            where: {
                id: author.id.toString(),
            },
        });
    });

    it('should return true when validating multiples ids', async () => {
        const author = await prismaFakeAuthor.create();
        const author2 = await prismaFakeAuthor.create({ name: 'Author 2' });

        const result = await authorsRepository.validateManyIds([
            author.id.toString(),
            author2.id.toString(),
        ]);

        expect(result).toBe(true);
    });

    it('should return false when fail to validate multiples ids', async () => {
        const result = await authorsRepository.validateManyIds(['1', '2']);

        expect(result).toBe(false);
    });
});
