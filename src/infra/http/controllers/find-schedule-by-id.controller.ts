import { CurrentUser } from '@infra/auth/current-user-decorator';
import { UserPayload } from '@infra/auth/jwt.strategy';
import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
import { NotAllowedError } from '@usecase/@errors/not-allowed-error';
import { FindReservationScheduleByIdUseCase } from '@usecase/find-reservation-schedule-by-id/find-reservation-schedule-by-id';

@Controller('/schedules/:id')
export class FindScheduleByIdController {
    constructor(private findScheduleById: FindReservationScheduleByIdUseCase) {}

    @Get()
    async handle(@Param('id') id: string, @CurrentUser() user: UserPayload) {
        const result = await this.findScheduleById.execute({
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
                message: 'Schedule not found',
                schedule: {},
            };
        }

        return { schedule: result.value };
    }
}
