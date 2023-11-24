import { Public } from '@infra/auth/public';
import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
import { FindReservationScheduleByIdUseCase } from '@usecase/find-reservation-schedule-by-id/find-reservation-schedule-by-id';

@Controller('/schedules/:id')
@Public()
export class FindScheduleByIdController {
    constructor(private findScheduleById: FindReservationScheduleByIdUseCase) {}

    @Get()
    async handle(@Param('id') id: string) {
        const result = await this.findScheduleById.execute({ id });

        if (result.isLeft()) {
            throw new BadRequestException();
        }

        if (!result.value) {
            return {
                message: 'Schedule not found',
                schedule: {},
            };
        }

        return { schedule: result.value };
    }
}
