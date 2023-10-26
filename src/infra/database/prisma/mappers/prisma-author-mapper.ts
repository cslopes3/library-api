import { Author } from '@domain/entities/author';
import { Prisma, Author as PrismaAuthor } from '@prisma/client';

export class PrismaAuthorMapper {
    static toDomainLayer(raw: PrismaAuthor) {
        return new Author(
            {
                name: raw.name,
            },
            raw.id,
            raw.createdAt,
            raw.updatedAt ?? undefined,
        );
    }

    static toPersistent(author: Author): Prisma.AuthorUncheckedCreateInput {
        return {
            id: author.id.toString(),
            name: author.name,
        };
    }
}
