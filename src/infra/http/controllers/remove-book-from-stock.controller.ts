import {
    BadRequestException,
    Body,
    Controller,
    HttpCode,
    NotFoundException,
    Param,
    Patch,
} from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from '../pipes/zod-validation-pipe';
import { ResourceNotFoundError } from '@usecase/@errors/resource-not-found-error';
import { RemoveBookFromStockUseCase } from '@usecase/remove-book-from-stock/remove-book-from-stock';
import { CantRemoveFromStockError } from '@usecase/@errors/cant-remove-from-stock-error';

const removeBookFromStockBodySchema = z.object({
    amount: z.number(),
});

type RemoveBookFromStockBodySchema = z.infer<
    typeof removeBookFromStockBodySchema
>;

const bodyValidationPipe = new ZodValidationPipe(removeBookFromStockBodySchema);

@Controller('/books/remove-from-stock/:id')
export class RemoveBookFromStockController {
    constructor(private removeBookFromStock: RemoveBookFromStockUseCase) {}

    @Patch()
    @HttpCode(204)
    async handle(
        @Param('id') id: string,
        @Body(bodyValidationPipe) body: RemoveBookFromStockBodySchema,
    ) {
        const { amount } = body;
        const result = await this.removeBookFromStock.execute({ id, amount });

        if (result.isLeft()) {
            const error = result.value;

            switch (error.constructor) {
                case ResourceNotFoundError:
                    throw new NotFoundException(error.message);
                case CantRemoveFromStockError:
                    throw new BadRequestException(error.message);
                default:
                    throw new BadRequestException();
            }
        }
    }
}
