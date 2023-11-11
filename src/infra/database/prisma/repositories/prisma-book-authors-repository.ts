import { BookAuthorsRepository } from '@repository/book-authors-repository';
import { PrismaService } from '../prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaBookAuthorsRepository implements BookAuthorsRepository {
    constructor(private prisma: PrismaService) {}

    async create(bookId: string, authorsId: string[]): Promise<void> {
        await this.prisma.bookAuthors.createMany({
            data: [
                ...authorsId.map((authorId) => ({
                    bookId: bookId,
                    authorId: authorId,
                })),
            ],
        });
    }

    async delete(bookId: string): Promise<void> {
        await this.prisma.bookAuthors.deleteMany({
            where: {
                bookId,
            },
        });
    }
}
