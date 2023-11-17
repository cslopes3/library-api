import { PrismaPublishersRepository } from './prisma-publishers-repository';
import {
    startEnvironment,
    stopEnvironment,
} from 'test/utils/test-environment-setup';
import { PrismaService } from '../prisma.service';
import {
    PrismaFakePublisher,
    createFakePublisher,
} from 'test/factories/fake-publisher-factory';

let prisma: PrismaService;
let publishersRepository: PrismaPublishersRepository;
let prismaFakePublisher: PrismaFakePublisher;

describe('[UT] - Authors repository', () => {
    beforeEach(() => {
        prisma = new PrismaService();
        startEnvironment();
        publishersRepository = new PrismaPublishersRepository(prisma);
        prismaFakePublisher = new PrismaFakePublisher(prisma);
    });

    afterEach(async () => {
        await stopEnvironment(prisma);
    });

    it('should create a publisher', async () => {
        const publisher = createFakePublisher();

        vi.spyOn(prisma.publisher, 'create');

        await publishersRepository.create(publisher);

        expect(prisma.publisher.create).toHaveBeenCalledWith({
            data: {
                id: publisher.id.toString(),
                name: publisher.name,
            },
        });
    });

    it('should find many publishers', async () => {
        const publisher = await prismaFakePublisher.create();
        const publisher2 = await prismaFakePublisher.create({
            name: 'Publisher 2',
        });

        const result = await publishersRepository.findMany({ page: 1 });

        expect(result).toHaveLength(2);
        expect(result![0].name).toEqual(publisher.name);
        expect(result![1].name).toEqual(publisher2.name);
    });

    it('should return an empty array when not found a publisher at findMany', async () => {
        const result = await publishersRepository.findMany({ page: 1 });

        expect(result).toHaveLength(0);
    });

    it('should find a publisher by id', async () => {
        const publisher = await prismaFakePublisher.create();

        const result = await publishersRepository.findById(
            publisher.id.toString(),
        );

        expect(result?.name).toEqual(publisher.name);
    });

    it('should return null when not found a publisher by id', async () => {
        const result = await publishersRepository.findById('1');

        expect(result).toBeNull();
    });

    it('should find an publisher by name', async () => {
        const publisher = await prismaFakePublisher.create();

        const result = await publishersRepository.findByName(publisher.name);

        expect(result?.name).toEqual(publisher.name);
    });

    it('should return null when not found a publisher by name', async () => {
        const result = await publishersRepository.findByName('Publisher 1');

        expect(result).toBeNull();
    });

    it('should update a publisher', async () => {
        const publisher = await prismaFakePublisher.create();
        const updatedName = 'Updated Name';

        vi.spyOn(prisma.publisher, 'update');

        publisher.changeName(updatedName);

        await publishersRepository.update(publisher);

        expect(prisma.publisher.update).toHaveBeenCalledWith({
            where: {
                id: publisher.id.toString(),
            },
            data: {
                id: publisher.id.toString(),
                name: updatedName,
            },
        });
    });

    it('should delete a publisher', async () => {
        const publisher = await prismaFakePublisher.create();

        vi.spyOn(prisma.publisher, 'delete');

        await publishersRepository.delete(publisher.id.toString());

        expect(prisma.publisher.delete).toHaveBeenCalledWith({
            where: {
                id: publisher.id.toString(),
            },
        });
    });

    it('should return true when validating multiples ids', async () => {
        const publisher = await prismaFakePublisher.create();
        const publisher2 = await prismaFakePublisher.create({
            name: 'Publisher 2',
        });

        const result = await publishersRepository.validateManyIds([
            publisher.id.toString(),
            publisher2.id.toString(),
        ]);

        expect(result).toBe(true);
    });

    it('should return false when fail to validate multiples ids', async () => {
        const result = await publishersRepository.validateManyIds(['1', '2']);

        expect(result).toBe(false);
    });
});
