import {
    BadRequestException,
    ConflictException,
    Controller,
    Get,
    Param,
} from '@nestjs/common';
import { UserDoesNotExistsError } from '@usecase/@errors/user-does-not-exists-error';
import { FindReservationsByUserIdUseCase } from '@usecase/find-reservations-by-user-id/find-reservations-by-user-id';

@Controller('/reservations/user/:userid')
export class FindReservationByUserIdController {
    constructor(
        private findReservationByUserId: FindReservationsByUserIdUseCase,
    ) {}

    @Get()
    async handle(@Param('userid') userId: string) {
        const result = await this.findReservationByUserId.execute({ userId });

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
                reservations: [],
            };
        }

        return { reservations: result.value };
    }
}
