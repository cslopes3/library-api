import { Role } from '@infra/auth/role';
import { RoleGuard } from '@infra/auth/role.guard';
import {
    BadRequestException,
    Controller,
    Delete,
    HttpCode,
    NotFoundException,
    Param,
    UseGuards,
} from '@nestjs/common';
import { UserRole } from '@shared/utils/user-role';
import { ResourceNotFoundError } from '@usecase/@errors/resource-not-found-error';
import { DeleteReservationUseCase } from '@usecase/delete-reservation/delete-reservation';

@Controller('/reservations/:id')
@Role(UserRole.ADMIN)
@UseGuards(RoleGuard)
export class DeleteReservationController {
    constructor(private deleteReservation: DeleteReservationUseCase) {}

    @Delete()
    @HttpCode(204)
    async handle(@Param('id') id: string) {
        const result = await this.deleteReservation.execute({ id });

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
