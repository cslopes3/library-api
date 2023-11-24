import {
    BadRequestException,
    Controller,
    Delete,
    HttpCode,
    NotFoundException,
    Param,
} from '@nestjs/common';
import { ResourceNotFoundError } from '@usecase/@errors/resource-not-found-error';
import { DeleteAuthorUseCase } from '@usecase/delete-author/delete-author';

@Controller('/authors/:id')
export class DeleteAuthorController {
    constructor(private deleteAuthor: DeleteAuthorUseCase) {}

    @Delete()
    @HttpCode(204)
    async handle(@Param('id') id: string) {
        const result = await this.deleteAuthor.execute({ id });

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
