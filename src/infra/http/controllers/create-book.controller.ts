import { CreateBookUseCase } from '@usecase/create-book/create-book';
import { z } from 'zod';
import { ZodValidationPipe } from '../pipes/zod-validation-pipe';
import {
    BadRequestException,
    Body,
    ConflictException,
    Controller,
    Post,
    UseGuards,
} from '@nestjs/common';
import { BookAlreadyExistsError } from '@usecase/@errors/book-already-exists-error';
import { AuthorDoesNotExistsError } from '@usecase/@errors/author-does-not-exists-error';
import { PublisherDoesNotExistsError } from '@usecase/@errors/publisher-does-not-exists-error';
import { UserRole } from '@shared/utils/user-role';
import { Role } from '@infra/auth/role';
import { RoleGuard } from '@infra/auth/role.guard';

const createBookBodySchema = z.object({
    name: z.string(),
    authors: z.array(
        z.object({
            id: z.string(),
            name: z.string(),
        }),
    ),
    publisher: z.object({
        id: z.string(),
        name: z.string(),
    }),
    editionDescription: z.string(),
    editionNumber: z.number(),
    editionYear: z.number(),
    quantity: z.number(),
    pages: z.number(),
});

type CreateBookBodySchema = z.infer<typeof createBookBodySchema>;

const bodyValidationPipe = new ZodValidationPipe(createBookBodySchema);

@Controller('/books')
@Role(UserRole.ADMIN)
@UseGuards(RoleGuard)
export class CreateBookController {
    constructor(private createBook: CreateBookUseCase) {}

    @Post()
    async handle(@Body(bodyValidationPipe) body: CreateBookBodySchema) {
        const result = await this.createBook.execute(body);
        if (result.isLeft()) {
            const error = result.value;

            switch (error.constructor) {
                case AuthorDoesNotExistsError ||
                    BookAlreadyExistsError ||
                    PublisherDoesNotExistsError:
                    throw new ConflictException(error.message);
                default:
                    throw new BadRequestException();
            }
        }
    }
}
