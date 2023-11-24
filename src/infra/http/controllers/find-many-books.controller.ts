import { Public } from '@infra/auth/public';
import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from '../pipes/zod-validation-pipe';
import { FindManyBooksUseCase } from '@usecase/find-many-book/find-many-books';

const pageQueryParamSchema = z
    .string()
    .optional()
    .default('1')
    .transform(Number)
    .pipe(z.number().min(1));

const queryValidationPipe = new ZodValidationPipe(pageQueryParamSchema);
type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>;

@Controller('/books')
@Public()
export class FindManyBooksController {
    constructor(private findManyBooks: FindManyBooksUseCase) {}

    @Get()
    async handle(
        @Query('page', queryValidationPipe) page: PageQueryParamSchema,
    ) {
        const result = await this.findManyBooks.execute({
            params: {
                page,
            },
        });

        if (result.isLeft()) {
            throw new BadRequestException();
        }

        if (result.value.length === 0) {
            return {
                message: 'No books found',
                books: [],
            };
        }

        return { books: result.value };
    }
}
