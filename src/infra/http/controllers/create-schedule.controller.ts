import { z } from 'zod';
import { ZodValidationPipe } from '../pipes/zod-validation-pipe';
import {
    BadRequestException,
    Body,
    ConflictException,
    Controller,
    Post,
} from '@nestjs/common';
import { CreateReservationScheduleUseCase } from '@usecase/create-reservation-schedule/create-reservation-schedule';
import { UserDoesNotExistsError } from '@usecase/@errors/user-does-not-exists-error';
import { BookDoesNotExistsError } from '@usecase/@errors/book-does-not-exists-error';
import { BookNotAvailableError } from '@usecase/@errors/book-not-available-error';
import { ReserveLimitError } from '@usecase/@errors/reserve-limit-error';
import { ScheduleLimitOfSameBookError } from '@usecase/@errors/schedule-limit-of-same-book-error';
import { ScheduleDeadlineError } from '@usecase/@errors/schedule-deadline-error';
import { CurrentUser } from '@infra/auth/current-user-decorator';
import { UserPayload } from '@infra/auth/jwt.strategy';
import { NotAllowedError } from '@usecase/@errors/not-allowed-error';

const createScheduleBodySchema = z.object({
    date: z.coerce.date(),
    userId: z.string(),
    scheduleItems: z.array(
        z.object({
            bookId: z.string(),
            name: z.string(),
        }),
    ),
});

type CreateScheduleBodySchema = z.infer<typeof createScheduleBodySchema>;

const bodyValidationPipe = new ZodValidationPipe(createScheduleBodySchema);

@Controller('/schedules')
export class CreateScheduleController {
    constructor(private createSchedule: CreateReservationScheduleUseCase) {}

    @Post()
    async handle(
        @Body(bodyValidationPipe) body: CreateScheduleBodySchema,
        @CurrentUser() user: UserPayload,
    ) {
        const { date, userId, scheduleItems } = body;
        const result = await this.createSchedule.execute({
            date,
            userId,
            scheduleItems,
            currentUserId: user.sub,
        });

        if (result.isLeft()) {
            const error = result.value;

            switch (error.constructor) {
                case UserDoesNotExistsError || BookDoesNotExistsError:
                    throw new ConflictException(error.message);
                case ReserveLimitError ||
                    ScheduleDeadlineError ||
                    BookNotAvailableError ||
                    ScheduleLimitOfSameBookError ||
                    NotAllowedError:
                    throw new BadRequestException(error.message);
                default:
                    throw new BadRequestException();
            }
        }
    }
}
