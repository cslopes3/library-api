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

    it('should return an empty array when not found an author at findMany', async () => {
        const result = await authorsRepository.findMany({ page: 1 });

        expect(result).toHaveLength(0);
    });

    it('should find an author by id', async () => {
        await prisma.author.create({
            data: {
                id: '1',
                name: 'Name 1',
            },
        });

        const result = await authorsRepository.findById('1');

        expect(result?.name).toEqual('Name 1');
    });

    it('should return null when not found an author by id', async () => {
        const result = await authorsRepository.findById('1');

        expect(result).toBeNull();
    });

    it('should find an author by name', async () => {
        await prisma.author.create({
            data: {
                name: 'Name 1',
            },
        });

        const result = await authorsRepository.findByName('Name 1');

        expect(result?.name).toEqual('Name 1');
    });

    it('should return null when not found an author by name', async () => {
        const result = await authorsRepository.findByName('Name 1');

        expect(result).toBeNull();
    });

    it('should update a author', async () => {
        vi.spyOn(prisma.author, 'update');

        await prisma.author.create({
            data: {
                id: '1',
                name: 'Name 1',
            },
        });

        const author = new Author({ name: 'Name 1' });

        await authorsRepository.update(author);

        expect(prisma.author.update).toHaveBeenCalledWith({
            where: {
                id: author.id.toString(),
            },
            data: {
                id: author.id.toString(),
                name: author.name,
            },
        });
    });

    it('should delete a author', async () => {
        vi.spyOn(prisma.author, 'delete');

        await prisma.author.create({
            data: {
                id: '1',
                name: 'Name 1',
            },
        });

        await authorsRepository.delete('1');

        expect(prisma.author.delete).toHaveBeenCalledWith({
            where: {
                id: '1',
            },
        });
    });

    it('should return true when validating multiples ids', async () => {
        await prisma.author.createMany({
            data: [
                {
                    id: '1',
                    name: 'Name 1',
                },
                {
                    id: '2',
                    name: 'Name 2',
                },
            ],
        });

        const result = await authorsRepository.validateManyIds(['1', '2']);

        expect(result).toBe(true);
    });

    it('should return false when fail to validate multiples ids', async () => {
        const result = await authorsRepository.validateManyIds(['1', '2']);

        expect(result).toBe(false);
    });
});
