import { PrismaPublishersRepository } from './prisma-publishers-repository';
import {
    startEnvironment,
    stopEnvironment,
} from 'test/utils/test-environment-setup';
import { PrismaService } from '../prisma.service';
import { FakePublisherFactory } from 'test/factories/fake-publisher-factory';

let prisma: PrismaService;
let publishersRepository: PrismaPublishersRepository;

describe('[UT] - Authors repository', () => {
    beforeEach(() => {
        prisma = new PrismaService();
        startEnvironment();
        publishersRepository = new PrismaPublishersRepository(prisma);
    });

    afterEach(async () => {
        await stopEnvironment(prisma);
    });

    it('should create a publisher', async () => {
        vi.spyOn(prisma.publisher, 'create');

        const publisher = FakePublisherFactory.create();

        await publishersRepository.create(publisher);

        expect(prisma.publisher.create).toHaveBeenCalledWith({
            data: {
                id: publisher.id.toString(),
                name: publisher.name,
            },
        });
    });

    it('should find many publishers', async () => {
        await prisma.publisher.createMany({
            data: [
                {
                    name: 'Publisher 1',
                },
                {
                    name: 'Publisher 2',
                },
            ],
        });

        const result = await publishersRepository.findMany({ page: 1 });

        expect(result).toHaveLength(2);
        expect(result![0].name).toEqual('Publisher 1');
        expect(result![1].name).toEqual('Publisher 2');
    });

    it('should return an empty array when not found a publisher at findMany', async () => {
        const result = await publishersRepository.findMany({ page: 1 });

        expect(result).toHaveLength(0);
    });

    it('should find a publisher by id', async () => {
        await prisma.publisher.create({
            data: {
                id: '1',
                name: 'Publisher 1',
            },
        });

        const result = await publishersRepository.findById('1');

        expect(result?.name).toEqual('Publisher 1');
    });

    it('should return null when not found a publisher by id', async () => {
        const result = await publishersRepository.findById('1');

        expect(result).toBeNull();
    });

    it('should find an publisher by name', async () => {
        await prisma.publisher.create({
            data: {
                name: 'Publisher 1',
            },
        });

        const result = await publishersRepository.findByName('Publisher 1');

        expect(result?.name).toEqual('Publisher 1');
    });

    it('should return null when not found a publisher by name', async () => {
        const result = await publishersRepository.findByName('Publisher 1');

        expect(result).toBeNull();
    });

    it('should update a publisher', async () => {
        vi.spyOn(prisma.publisher, 'update');

        await prisma.publisher.create({
            data: {
                id: '1',
                name: 'Publisher 1',
            },
        });

        const publisher = FakePublisherFactory.create();

        await publishersRepository.update(publisher);

        expect(prisma.publisher.update).toHaveBeenCalledWith({
            where: {
                id: publisher.id.toString(),
            },
            data: {
                id: publisher.id.toString(),
                name: publisher.name,
            },
        });
    });

    it('should delete a publisher', async () => {
        vi.spyOn(prisma.publisher, 'delete');

        await prisma.publisher.create({
            data: {
                id: '1',
                name: 'Publisher 1',
            },
        });

        await publishersRepository.delete('1');

        expect(prisma.publisher.delete).toHaveBeenCalledWith({
            where: {
                id: '1',
            },
        });
    });

    it('should return true when validating multiples ids', async () => {
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

        const result = await publishersRepository.validateManyIds(['1', '2']);

        expect(result).toBe(true);
    });

    it('should return false when fail to validate multiples ids', async () => {
        const result = await publishersRepository.validateManyIds(['1', '2']);

        expect(result).toBe(false);
    });
});
