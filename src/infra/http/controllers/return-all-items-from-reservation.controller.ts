import { Role } from '@infra/auth/role';
import { RoleGuard } from '@infra/auth/role.guard';
import {
    BadRequestException,
    Controller,
    HttpCode,
    NotFoundException,
    Param,
    Patch,
    UseGuards,
} from '@nestjs/common';
import { UserRole } from '@shared/utils/user-role';
import { AllItemsAlreadyReturnedError } from '@usecase/@errors/all-items-already-returned-error';
import { ResourceNotFoundError } from '@usecase/@errors/resource-not-found-error';
import { ReturnAllItemsFromReservationUseCase } from '@usecase/return-all-items-from-reservation/return-all-items-from-reservation';

@Controller('/reservations/return/:id')
@Role(UserRole.ADMIN)
@UseGuards(RoleGuard)
export class ReturnAllItemsFromReservationController {
    constructor(
        private returnAllItemsFromReservation: ReturnAllItemsFromReservationUseCase,
    ) {}

    @Patch()
    @HttpCode(204)
    async handle(@Param('id') id: string) {
        const result = await this.returnAllItemsFromReservation.execute({ id });

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
