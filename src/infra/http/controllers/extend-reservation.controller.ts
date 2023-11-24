import {
    BadRequestException,
    Controller,
    HttpCode,
    NotFoundException,
    Param,
    Patch,
} from '@nestjs/common';
import { AllItemsAlreadyReturnedError } from '@usecase/@errors/all-items-already-returned-error';
import { AlreadyExtendedError } from '@usecase/@errors/already-extended-error';
import { ExpiredDateError } from '@usecase/@errors/expired-date-error';
import { ResourceNotFoundError } from '@usecase/@errors/resource-not-found-error';
import { ExtendReservationUseCase } from '@usecase/extend-reservation/extend-reservation';

@Controller('/reservations/extend/:id')
export class ExtendReservationController {
    constructor(private extendReservation: ExtendReservationUseCase) {}

    @Patch()
    @HttpCode(204)
    async handle(@Param('id') id: string) {
        const result = await this.extendReservation.execute({ id });

        if (result.isLeft()) {
            const error = result.value;

            switch (error.constructor) {
                case ResourceNotFoundError:
                    throw new NotFoundException(error.message);
                case AlreadyExtendedError ||
                    ExpiredDateError ||
                    AllItemsAlreadyReturnedError:
                    throw new BadRequestException(error.message);
                default:
                    throw new BadRequestException();
            }
        }
    }
}
