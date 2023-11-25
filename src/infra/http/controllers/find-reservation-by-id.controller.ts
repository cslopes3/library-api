import { CurrentUser } from '@infra/auth/current-user-decorator';
import { UserPayload } from '@infra/auth/jwt.strategy';
import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
import { NotAllowedError } from '@usecase/@errors/not-allowed-error';
import { FindReservationByIdUseCase } from '@usecase/find-reservation-by-id/find-reservation-by-id';

@Controller('/reservations/:id')
export class FindReservationByIdController {
    constructor(private findReservationById: FindReservationByIdUseCase) {}

    @Get()
    async handle(@Param('id') id: string, @CurrentUser() user: UserPayload) {
        const result = await this.findReservationById.execute({
            id,
            currentUserId: user.sub,
        });

        if (result.isLeft()) {
            const error = result.value;

            switch (error.constructor) {
                case NotAllowedError:
                    throw new BadRequestException(error.message);
                default:
                    throw new BadRequestException();
            }
        }

        if (!result.value) {
            return {
                message: 'Reservation not found',
                reservation: {},
            };
        }

        return { reservation: result.value };
    }
}
