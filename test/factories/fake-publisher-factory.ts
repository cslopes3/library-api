import { Publisher } from '@domain/entities/publisher';
import { PrismaPublisherMapper } from '@infra/database/prisma/mappers/prisma-publisher-mapper';
import { PrismaService } from '@infra/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

export function createFakePublisher(options?: Partial<Publisher>): Publisher {
    const publisherDefaultValues = {
        name: 'Publisher 1',
    };

    return new Publisher({ ...publisherDefaultValues, ...options });
}

@Injectable()
export class PrismaFakePublisher {
    constructor(private prisma: PrismaService) {}

    async create(options?: Partial<Publisher>): Promise<Publisher> {
        const publisher = createFakePublisher(options);

        await this.prisma.publisher.create({
            data: PrismaPublisherMapper.toPersistent(publisher),
        });

        return publisher;
    }
}
