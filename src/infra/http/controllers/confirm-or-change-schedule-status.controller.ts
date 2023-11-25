import {
    BadRequestException,
    Body,
    Controller,
    HttpCode,
    NotFoundException,
    Param,
    Patch,
} from '@nestjs/common';
import { ConfirmOrChangeScheduleStatusUseCase } from '@usecase/confirm-or-change-schedule-status/confirm-or-change-schedule-status';
import { z } from 'zod';
import { ZodValidationPipe } from '../pipes/zod-validation-pipe';
import { ResourceNotFoundError } from '@usecase/@errors/resource-not-found-error';
import { CantChangeStatusError } from '@usecase/@errors/cant-change-status-error';
import { UserPayload } from '@infra/auth/jwt.strategy';
import { CurrentUser } from '@infra/auth/current-user-decorator';
import { NotAllowedError } from '@usecase/@errors/not-allowed-error';

const confirmOrChangeScheduleStatusBodySchema = z.object({
    status: z.string(),
});

type ConfirmOrChangeScheduleStatusBodySchema = z.infer<
    typeof confirmOrChangeScheduleStatusBodySchema
>;

const bodyValidationPipe = new ZodValidationPipe(
    confirmOrChangeScheduleStatusBodySchema,
);

@Controller('/schedules/status/:id')
export class ConfirmOrChangeScheduleStatusController {
    constructor(
        private confirmOrChangeScheduleStatus: ConfirmOrChangeScheduleStatusUseCase,
    ) {}

    @Patch()
    @HttpCode(204)
    async handle(
        @Param('id') id: string,
        @CurrentUser() user: UserPayload,
        @Body(bodyValidationPipe) body: ConfirmOrChangeScheduleStatusBodySchema,
    ) {
        const { status } = body;

        const result = await this.confirmOrChangeScheduleStatus.execute({
            id,
            status,
            currentUserId: user.sub,
        });

        if (result.isLeft()) {
            const error = result.value;

            switch (error.constructor) {
                case ResourceNotFoundError:
                    throw new NotFoundException(error.message);
                case CantChangeStatusError || NotAllowedError:
                    throw new BadRequestException(error.message);
                default:
                    throw new BadRequestException();
            }
        }
    }
}
