import {
    BadRequestException,
    ConflictException,
    Controller,
    Get,
    Param,
} from '@nestjs/common';
import { UserDoesNotExistsError } from '@usecase/@errors/user-does-not-exists-error';
import { FindLastThirtyScheduleByUserIdUseCase } from '@usecase/find-last-thirty-days-schedule-by-user-id/find-last-thirty-days-schedule-by-user-id';

@Controller('/schedules/user/:userid')
export class FindLasThirtyDaysScheduleByUserIdController {
    constructor(
        private findLasThirtyDaysScheduleByUserId: FindLastThirtyScheduleByUserIdUseCase,
    ) {}

    @Get()
    async handle(@Param('userid') userId: string) {
        const result = await this.findLasThirtyDaysScheduleByUserId.execute({
            userId,
        });

        if (result.isLeft()) {
            const error = result.value;

            switch (error.constructor) {
                case UserDoesNotExistsError:
                    throw new ConflictException(error.message);
                default:
                    throw new BadRequestException();
            }
        }

        if (result.value.length === 0) {
            return {
                message: 'No reservations found',
                schedules: [],
            };
        }

        return { schedules: result.value };
    }
}
