import { Public } from '@infra/auth/public';
import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
import { FindReservationByIdUseCase } from '@usecase/find-reservation-by-id/find-reservation-by-id';

@Controller('/reservations/:id')
@Public()
export class FindReservationByIdController {
    constructor(private findReservationById: FindReservationByIdUseCase) {}

    @Get()
    async handle(@Param('id') id: string) {
        const result = await this.findReservationById.execute({ id });

        if (result.isLeft()) {
            throw new BadRequestException();
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
