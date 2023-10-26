import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { PrismaService } from '@infra/database/prisma/prisma.service';
import { ZodValidationPipe } from '@infra/http/pipes/zod-validation-pipe';
import { z } from 'zod';

const createBookBodySchema = z.object({
    name: z.string(),
    editionNumber: z.number().int(),
    editionDescription: z.string(),
    editionYear: z.number().int(),
    quantity: z.number().int(),
    pages: z.number().int(),
    publisherId: z.string(),
    authorId: z.array(z.string()),
});

type CreateBookBodySchema = z.infer<typeof createBookBodySchema>;

@Controller('/books')
export class AddBookController {
    constructor(private prisma: PrismaService) {}

    @Post()
    @UsePipes(new ZodValidationPipe(createBookBodySchema))
    async handle(@Body() body: CreateBookBodySchema) {
        const {
            name,
            editionNumber,
            editionDescription,
            editionYear,
            quantity,
            pages,
            publisherId,
            authorId,
        } = body;

        const numberOfExistingAuthors = await this.prisma.author.count({
            where: {
                id: { in: authorId },
            },
        });

        if (numberOfExistingAuthors !== authorId.length) {
            // throw new
        }

        await this.prisma.book.create({
            data: {
                name,
                editionNumber,
                editionDescription,
                editionYear,
                quantity,
                pages,
                available: quantity,
                publisherId,
            },
        });
    }
}
