import {
    BadRequestException,
    Controller,
    Delete,
    HttpCode,
    NotFoundException,
    Param,
} from '@nestjs/common';
import { ResourceNotFoundError } from '@usecase/@errors/resource-not-found-error';
import { DeletePublisherUseCase } from '@usecase/delete-publisher/delete-publisher';

@Controller('/publishers/:id')
export class DeletePublisherController {
    constructor(private deletePublisher: DeletePublisherUseCase) {}

    @Delete()
    @HttpCode(204)
    async handle(@Param('id') id: string) {
        const result = await this.deletePublisher.execute({ id });

        if (result.isLeft()) {
            const error = result.value;

            switch (error.constructor) {
                case ResourceNotFoundError:
                    throw new NotFoundException(error.message);
                default:
                    throw new BadRequestException();
            }
        }
    }
}
