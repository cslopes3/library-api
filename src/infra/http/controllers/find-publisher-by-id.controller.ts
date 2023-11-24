import { Public } from '@infra/auth/public';
import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
import { FindPublisherByIdUseCase } from '@usecase/find-publisher-by-id/find-publisher-by-id';

@Controller('/publishers/:id')
@Public()
export class FindPublisherByIdController {
    constructor(private findPublisherById: FindPublisherByIdUseCase) {}

    @Get()
    async handle(@Param('id') id: string) {
        const result = await this.findPublisherById.execute({ id });

        if (result.isLeft()) {
            throw new BadRequestException();
        }

        if (!result.value) {
            return {
                message: 'Publisher not found',
                publisher: {},
            };
        }

        return { publisher: result.value };
    }
}
