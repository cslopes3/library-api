import { Author } from '@domain/entities/author';
import { PrismaAuthorMapper } from '@infra/database/prisma/mappers/prisma-author-mapper';
import { PrismaService } from '@infra/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

export function createFakeAuthor(options?: Partial<Author>): Author {
    const authorDefaultValues = {
        name: 'Author 1',
    };

    return new Author({ ...authorDefaultValues, ...options });
}

@Injectable()
export class PrismaFakeAuthor {
    constructor(private prisma: PrismaService) {}

    async create(options?: Partial<Author>): Promise<Author> {
        const author = createFakeAuthor(options);

        await this.prisma.author.create({
            data: PrismaAuthorMapper.toPersistent(author),
        });

        return author;
    }
}
