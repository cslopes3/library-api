import {
    BadRequestException,
    Body,
    Controller,
    HttpCode,
    NotFoundException,
    Param,
    Patch,
} from '@nestjs/common';
import { AddBookToStockUseCase } from '@usecase/add-book-to-stock/add-book-to-stock';
import { z } from 'zod';
import { ZodValidationPipe } from '../pipes/zod-validation-pipe';
import { ResourceNotFoundError } from '@usecase/@errors/resource-not-found-error';

const addToStockBodySchema = z.object({
    amount: z.number(),
});

type AddToStockBodySchema = z.infer<typeof addToStockBodySchema>;

const bodyValidationPipe = new ZodValidationPipe(addToStockBodySchema);

@Controller('/books/add-to-stock/:id')
export class AddBookToStockController {
    constructor(private addBookToStock: AddBookToStockUseCase) {}

    @Patch()
    @HttpCode(204)
    async handle(
        @Param('id') id: string,
        @Body(bodyValidationPipe) body: AddToStockBodySchema,
    ) {
        const { amount } = body;
        const result = await this.addBookToStock.execute({ id, amount });

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
