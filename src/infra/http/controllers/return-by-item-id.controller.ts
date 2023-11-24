import {
    BadRequestException,
    Controller,
    HttpCode,
    NotFoundException,
    Param,
    Patch,
} from '@nestjs/common';
import { AllItemsAlreadyReturnedError } from '@usecase/@errors/all-items-already-returned-error';
import { ResourceNotFoundError } from '@usecase/@errors/resource-not-found-error';
import { ReturnByItemIdUseCase } from '@usecase/return-by-item-id/return-by-item-id';

@Controller('/reservations/return-item/:id')
export class ReturnByItemIdController {
    constructor(private returnByItemId: ReturnByItemIdUseCase) {}

    @Patch()
    @HttpCode(204)
    async handle(@Param('id') id: string) {
        const result = await this.returnByItemId.execute({ id });

        if (result.isLeft()) {
            const error = result.value;

            switch (error.constructor) {
                case ResourceNotFoundError:
                    throw new NotFoundException(error.message);
                case AllItemsAlreadyReturnedError:
                    throw new BadRequestException(error.message);
                default:
                    throw new BadRequestException();
            }
        }
    }
}
