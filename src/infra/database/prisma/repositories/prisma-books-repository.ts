import { Injectable } from '@nestjs/common';
import { BooksRepository } from '@repository/books-repository';
import { PrismaService } from '../prisma.service';
import { Book } from '@domain/entities/book';
import { PaginationParams } from '@shared/repositories/pagination-params';
import { PrismaBookMapper } from '../mappers/prisma-book-mapper';

@Injectable()
export class PrismaBooksRepository implements BooksRepository {
    constructor(private prisma: PrismaService) {}

    async create(book: Book): Promise<void> {
        const data = PrismaBookMapper.toPersistent(book);

        await this.prisma.book.create({ data });
    }

    async update(book: Book): Promise<void> {
        //TODO This logic should be at application layer
        const data = PrismaBookMapper.toPersistentWithoutAmount(book);

        await this.prisma.book.update({
            where: {
                id: data.id?.toString(),
            },
            data,
        });
    }

    async delete(id: string): Promise<void> {
        await this.prisma.book.delete({
            where: {
                id,
            },
        });
    }

    async findById(id: string): Promise<Book | null> {
        const book = await this.prisma.book.findUnique({
            where: {
                id,
            },
            include: {
                authors: {
                    include: {
                        author: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                publisher: true,
            },
        });

        if (!book) {
            return null;
        }

        return PrismaBookMapper.toDomainLayer(book);
    }

    async findByName(name: string): Promise<Book | null> {
        const book = await this.prisma.book.findFirst({
            where: {
                name,
            },
            include: {
                authors: {
                    include: {
                        author: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                publisher: true,
            },
        });

        if (!book) {
            return null;
        }

        return PrismaBookMapper.toDomainLayer(book);
    }

    async findMany(
        { page }: PaginationParams,
        ids?: string[],
    ): Promise<Book[] | []> {
        const book = await this.prisma.book.findMany({
            where: {
                ...(ids ? { id: { in: ids } } : {}),
            },
            include: {
                authors: {
                    include: {
                        author: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                publisher: true,
            },
            orderBy: {
                name: 'asc',
            },
            take: 20,
            skip: (page - 1) * 20,
        });

        return book.map(PrismaBookMapper.toDomainLayer);
    }

    async addBookToStock(id: string, amount: number): Promise<void> {
        await this.prisma.book.update({
            where: {
                id,
            },
            data: {
                available: {
                    increment: amount,
                },
            },
        });
    }

    async removeBookFromStock(id: string, amount: number): Promise<void> {
        await this.prisma.book.update({
            where: {
                id,
            },
            data: {
                available: {
                    decrement: amount,
                },
            },
        });
    }
}
