import {
    BadRequestException,
    Controller,
    Delete,
    HttpCode,
    NotFoundException,
    Param,
} from '@nestjs/common';
import { ResourceNotFoundError } from '@usecase/@errors/resource-not-found-error';
import { DeleteBookUseCase } from '@usecase/delete-book/delete-book';

@Controller('/books/:id')
export class DeleteBookController {
    constructor(private deleteBook: DeleteBookUseCase) {}

    @Delete()
    @HttpCode(204)
    async handle(@Param('id') id: string) {
        const result = await this.deleteBook.execute({ id });

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
