import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { ZodValidationPipe } from '@infra/http/pipes/zod-validation-pipe';
import { z } from 'zod';
import { FindManyPublishersUseCase } from '@usecase/find-many-publishers/find-many-publishers';
import { Public } from '@infra/auth/public';

const pageQueryParamSchema = z
    .string()
    .optional()
    .default('1')
    .transform(Number)
    .pipe(z.number().min(1));

const queryValidationPipe = new ZodValidationPipe(pageQueryParamSchema);
type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>;

@Controller('/publishers')
@Public()
export class FindManyPublishersController {
    constructor(private findManyPublisher: FindManyPublishersUseCase) {}

    @Get()
    async handle(
        @Query('page', queryValidationPipe) page: PageQueryParamSchema,
    ) {
        const result = await this.findManyPublisher.execute({
            params: {
                page,
            },
        });

        if (result.isLeft()) {
            throw new BadRequestException();
        }

        if (result.value.length === 0) {
            return {
                message: 'No publishers found',
                publishers: [],
            };
        }

        return { publishers: result.value };
    }
}
