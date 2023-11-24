import { CreateReservationUseCase } from '@usecase/create-reservation/create-reservation';
import { z } from 'zod';
import { ZodValidationPipe } from '../pipes/zod-validation-pipe';
import {
    BadRequestException,
    Body,
    ConflictException,
    Controller,
    Post,
} from '@nestjs/common';
import { UserDoesNotExistsError } from '@usecase/@errors/user-does-not-exists-error';
import { BookDoesNotExistsError } from '@usecase/@errors/book-does-not-exists-error';
import { ReserveLimitError } from '@usecase/@errors/reserve-limit-error';
import { BookWithReturnDateExpiredError } from '@usecase/@errors/book-with-return-date-expired-error';
import { BookNotAvailableError } from '@usecase/@errors/book-not-available-error';

const createReservationBodySchema = z.object({
    userId: z.string(),
    reservationItems: z.array(
        z.object({
            bookId: z.string(),
            name: z.string(),
        }),
    ),
});

type CreateReservationBodySchema = z.infer<typeof createReservationBodySchema>;

const bodyValidationPipe = new ZodValidationPipe(createReservationBodySchema);

@Controller('/reservations')
export class CreateReservationController {
    constructor(private createReservation: CreateReservationUseCase) {}

    @Post()
    async handle(@Body(bodyValidationPipe) body: CreateReservationBodySchema) {
        const result = await this.createReservation.execute(body);

        if (result.isLeft()) {
            const error = result.value;

            switch (error.constructor) {
                case UserDoesNotExistsError || BookDoesNotExistsError:
                    throw new ConflictException(error.message);
                case ReserveLimitError ||
                    BookWithReturnDateExpiredError ||
                    BookNotAvailableError:
                    throw new BadRequestException(error.message);
                default:
                    throw new BadRequestException();
            }
        }
    }
}
