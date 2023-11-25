import { CurrentUser } from '@infra/auth/current-user-decorator';
import { UserPayload } from '@infra/auth/jwt.strategy';
import {
    BadRequestException,
    ConflictException,
    Controller,
    Get,
    Param,
} from '@nestjs/common';
import { NotAllowedError } from '@usecase/@errors/not-allowed-error';
import { UserDoesNotExistsError } from '@usecase/@errors/user-does-not-exists-error';
import { FindLastThirtyScheduleByUserIdUseCase } from '@usecase/find-last-thirty-days-schedule-by-user-id/find-last-thirty-days-schedule-by-user-id';

@Controller('/schedules/user/:userid')
export class FindLasThirtyDaysScheduleByUserIdController {
    constructor(
        private findLasThirtyDaysScheduleByUserId: FindLastThirtyScheduleByUserIdUseCase,
    ) {}

    @Get()
    async handle(
        @Param('userid') userId: string,
        @CurrentUser() user: UserPayload,
    ) {
        const result = await this.findLasThirtyDaysScheduleByUserId.execute({
            userId,
            currentUserId: user.sub,
        });

        if (result.isLeft()) {
            const error = result.value;

            switch (error.constructor) {
                case UserDoesNotExistsError:
                    throw new ConflictException(error.message);
                case NotAllowedError:
                    throw new BadRequestException(error.message);
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
