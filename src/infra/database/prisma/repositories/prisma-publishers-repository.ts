import { Publisher } from '@domain/entities/publisher';
import { Injectable } from '@nestjs/common';
import { PublishersRepository } from '@repository/publishers-repository';
import { PaginationParams } from '@shared/repositories/pagination-params';
import { PrismaService } from '../prisma.service';
import { PrismaPublisherMapper } from '../mappers/prisma-publisher-mapper';

@Injectable()
export class PrismaPublishersRepository implements PublishersRepository {
    constructor(private prisma: PrismaService) {}

    async findById(id: string): Promise<Publisher | null> {
        const publisher = await this.prisma.publisher.findUnique({
            where: {
                id,
            },
        });

        if (!publisher) {
            return null;
        }

        return PrismaPublisherMapper.toDomainLayer(publisher);
    }

    async findByName(name: string): Promise<Publisher | null> {
        const publisher = await this.prisma.publisher.findFirst({
            where: {
                name,
            },
        });

        if (!publisher) {
            return null;
        }

        return PrismaPublisherMapper.toDomainLayer(publisher);
    }

    async findMany({ page }: PaginationParams): Promise<Publisher[] | []> {
        const publishers = await this.prisma.publisher.findMany({
            orderBy: {
                name: 'asc',
            },
            take: 20,
            skip: (page - 1) * 20,
        });

        return publishers.map(PrismaPublisherMapper.toDomainLayer);
    }

    async create(publisher: Publisher): Promise<void> {
        const data = PrismaPublisherMapper.toPersistent(publisher);

        await this.prisma.publisher.create({
            data,
        });
    }

    async update(publisher: Publisher): Promise<void> {
        const data = PrismaPublisherMapper.toPersistent(publisher);

        await this.prisma.publisher.update({
            where: {
                id: data.id,
            },
            data,
        });
    }

    async delete(id: string): Promise<void> {
        await this.prisma.publisher.delete({
            where: {
                id,
            },
        });
    }

    async validateManyIds(ids: string[]): Promise<boolean> {
        const publishers = await this.prisma.publisher.findMany({
            where: {
                id: { in: ids },
            },
        });

        return publishers.length === ids.length;
    }
}
