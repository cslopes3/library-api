import { Public } from '@infra/auth/public';
import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
import { FindAuthorByIdUseCase } from '@usecase/find-author-by-id/find-author-by-id';

@Controller('/authors/:id')
@Public()
export class FindAuthorByIdController {
    constructor(private findAuthorById: FindAuthorByIdUseCase) {}

    @Get()
    async handle(@Param('id') id: string) {
        const result = await this.findAuthorById.execute({ id });

        if (result.isLeft()) {
            throw new BadRequestException();
        }

        if (!result.value) {
            return {
                message: 'Author not found',
                author: {},
            };
        }

        return { author: result.value };
    }
}
