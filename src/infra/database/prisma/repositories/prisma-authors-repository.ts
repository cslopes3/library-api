import { Author } from '@domain/entities/author';
import { Injectable } from '@nestjs/common';
import { AuthorsRepository } from '@repository/authors-repository';
import { PaginationParams } from '@shared/repositories/pagination-params';
import { PrismaService } from '../prisma.service';
import { PrismaAuthorMapper } from '../mappers/prisma-author-mapper';

@Injectable()
export class PrismaAuthorsRepository implements AuthorsRepository {
    constructor(private prisma: PrismaService) {}

    async findById(id: string): Promise<Author | null> {
        const author = await this.prisma.author.findUnique({
            where: {
                id,
            },
        });

        if (!author) {
            return null;
        }

        return PrismaAuthorMapper.toDomainLayer(author);
    }

    async findByName(name: string): Promise<Author | null> {
        const author = await this.prisma.author.findFirst({
            where: {
                name,
            },
        });

        if (!author) {
            return null;
        }

        return PrismaAuthorMapper.toDomainLayer(author);
    }

    async findMany({ page }: PaginationParams): Promise<Author[] | []> {
        const authors = await this.prisma.author.findMany({
            orderBy: {
                name: 'asc',
            },
            take: 20,
            skip: (page - 1) * 20,
        });

        return authors.map(PrismaAuthorMapper.toDomainLayer);
    }

    async create(author: Author): Promise<void> {
        const data = PrismaAuthorMapper.toPersistent(author);

        await this.prisma.author.create({
            data,
        });
    }

    async update(author: Author): Promise<void> {
        const data = PrismaAuthorMapper.toPersistent(author);

        await this.prisma.author.update({
            where: {
                id: data.id,
            },
            data,
        });
    }

    async delete(id: string): Promise<void> {
        await this.prisma.author.delete({
            where: {
                id,
            },
        });
    }

    async validateManyIds(ids: string[]): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
}
