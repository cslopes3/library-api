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
import { FindReservationsByUserIdUseCase } from '@usecase/find-reservations-by-user-id/find-reservations-by-user-id';

@Controller('/reservations/user/:userid')
export class FindReservationByUserIdController {
    constructor(
        private findReservationByUserId: FindReservationsByUserIdUseCase,
    ) {}

    @Get()
    async handle(
        @Param('userid') userId: string,
        @CurrentUser() user: UserPayload,
    ) {
        const result = await this.findReservationByUserId.execute({
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
                reservations: [],
            };
        }

        return { reservations: result.value };
    }
}
