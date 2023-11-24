import { Public } from '@infra/auth/public';
import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
import { FindBookByIdUseCase } from '@usecase/find-book-by-id/find-book-by-id';

@Controller('/books/:id')
@Public()
export class FindBookByIdController {
    constructor(private findBookById: FindBookByIdUseCase) {}

    @Get()
    async handle(@Param('id') id: string) {
        const result = await this.findBookById.execute({ id });

        if (result.isLeft()) {
            throw new BadRequestException();
        }

        if (!result.value) {
            return {
                message: 'Book not found',
                book: {},
            };
        }

        return { book: result.value };
    }
}
