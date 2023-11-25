import {
    BadRequestException,
    Body,
    ConflictException,
    Controller,
    HttpCode,
    NotFoundException,
    Param,
    Put,
    UseGuards,
} from '@nestjs/common';
import { UpdateBookUseCase } from '@usecase/update-book/update-book';
import { z } from 'zod';
import { ZodValidationPipe } from '../pipes/zod-validation-pipe';
import { BookAlreadyExistsError } from '@usecase/@errors/book-already-exists-error';
import { AuthorDoesNotExistsError } from '@usecase/@errors/author-does-not-exists-error';
import { PublisherDoesNotExistsError } from '@usecase/@errors/publisher-does-not-exists-error';
import { ResourceNotFoundError } from '@usecase/@errors/resource-not-found-error';
import { Role } from '@infra/auth/role';
import { UserRole } from '@shared/utils/user-role';
import { RoleGuard } from '@infra/auth/role.guard';

const updateBookBodySchema = z.object({
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

type UpdateBookBodySchema = z.infer<typeof updateBookBodySchema>;

const bodyValidationPipe = new ZodValidationPipe(updateBookBodySchema);

@Controller('/books/:id')
@Role(UserRole.ADMIN)
@UseGuards(RoleGuard)
export class UpdateBookController {
    constructor(private updateBook: UpdateBookUseCase) {}

    @Put()
    @HttpCode(204)
    async handle(
        @Body(bodyValidationPipe) body: UpdateBookBodySchema,
        @Param('id') bookId: string,
    ) {
        const result = await this.updateBook.execute({ id: bookId, ...body });

        if (result.isLeft()) {
            const error = result.value;

            switch (error.constructor) {
                case BookAlreadyExistsError ||
                    AuthorDoesNotExistsError ||
                    PublisherDoesNotExistsError:
                    throw new ConflictException(error.message);
                case ResourceNotFoundError:
                    throw new NotFoundException(error.message);
                default:
                    throw new BadRequestException();
            }
        }
    }
}
