import { Publisher } from '@domain/entities/publisher';
import { Prisma, Publisher as PrismaPublisher } from '@prisma/client';

export class PrismaPublisherMapper {
    static toDomainLayer(raw: PrismaPublisher) {
        return new Publisher(
            {
                name: raw.name,
            },
            raw.id,
            raw.createdAt,
            raw.updatedAt ?? undefined,
        );
    }

    static toPersistent(
        publisher: Publisher,
    ): Prisma.PublisherUncheckedCreateInput {
        return {
            id: publisher.id.toString(),
            name: publisher.name,
        };
    }
}
