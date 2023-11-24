import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { ZodValidationPipe } from '@infra/http/pipes/zod-validation-pipe';
import { z } from 'zod';
import { FindManyAuthorsUseCase } from '@usecase/find-many-authors/find-many-authors';
import { Public } from '@infra/auth/public';

const pageQueryParamSchema = z
    .string()
    .optional()
    .default('1')
    .transform(Number)
    .pipe(z.number().min(1));

const queryValidationPipe = new ZodValidationPipe(pageQueryParamSchema);
type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>;

@Controller('/authors')
@Public()
export class FindManyAuthorsController {
    constructor(private findManyAuthor: FindManyAuthorsUseCase) {}

    @Get()
    async handle(
        @Query('page', queryValidationPipe) page: PageQueryParamSchema,
    ) {
        const result = await this.findManyAuthor.execute({
            params: {
                page,
            },
        });

        if (result.isLeft()) {
            throw new BadRequestException();
        }

        if (result.value.length === 0) {
            return {
                message: 'No authors found',
                authors: [],
            };
        }

        return { authors: result.value };
    }
}
