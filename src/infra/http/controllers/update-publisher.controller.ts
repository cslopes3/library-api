import { UpdatePublisherUseCase } from '@usecase/update-publisher/update-publisher';
import { z } from 'zod';
import { ZodValidationPipe } from '../pipes/zod-validation-pipe';
import {
    BadRequestException,
    Body,
    ConflictException,
    Controller,
    HttpCode,
    NotFoundException,
    Param,
    Put,
    UseGuards,
} from '@nestjs/common';
import { ResourceNotFoundError } from '@usecase/@errors/resource-not-found-error';
import { PublisherAlreadyExistsError } from '@usecase/@errors/publisher-already-exists-error';
import { Role } from '@infra/auth/role';
import { UserRole } from '@shared/utils/user-role';
import { RoleGuard } from '@infra/auth/role.guard';

const updatePublisherBodySchema = z.object({
    name: z.string(),
});

type UpdatePublisherBodySchema = z.infer<typeof updatePublisherBodySchema>;

const bodyValidationPipe = new ZodValidationPipe(updatePublisherBodySchema);

@Controller('/publishers/:id')
@Role(UserRole.ADMIN)
@UseGuards(RoleGuard)
export class UpdatePublisherController {
    constructor(private updatePublisher: UpdatePublisherUseCase) {}

    @Put()
    @HttpCode(204)
    async handle(
        @Body(bodyValidationPipe) body: UpdatePublisherBodySchema,
        @Param('id') publisherId: string,
    ) {
        const { name } = body;

        const result = await this.updatePublisher.execute({
            id: publisherId,
            name,
        });

        if (result.isLeft()) {
            const error = result.value;

            switch (error.constructor) {
                case ResourceNotFoundError:
                    throw new NotFoundException(error.message);
                case PublisherAlreadyExistsError:
                    throw new ConflictException(error.message);
                default:
                    throw new BadRequestException();
            }
        }
    }
}
