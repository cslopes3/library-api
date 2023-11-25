import {
    BadRequestException,
    Body,
    ConflictException,
    Controller,
    Post,
    UseGuards,
} from '@nestjs/common';
import { ZodValidationPipe } from '@infra/http/pipes/zod-validation-pipe';
import { z } from 'zod';
import { CreatePublisherUseCase } from '@usecase/create-publisher/create-publisher';
import { PublisherAlreadyExistsError } from '@usecase/@errors/publisher-already-exists-error';
import { RoleGuard } from '@infra/auth/role.guard';
import { UserRole } from '@shared/utils/user-role';
import { Role } from '@infra/auth/role';

const createPublisherBodySchema = z.object({
    name: z.string(),
});

type CreatePublisherBodySchema = z.infer<typeof createPublisherBodySchema>;

const bodyValidationPipe = new ZodValidationPipe(createPublisherBodySchema);

@Controller('/publishers')
@Role(UserRole.ADMIN)
@UseGuards(RoleGuard)
export class CreatePublisherController {
    constructor(private createPublisher: CreatePublisherUseCase) {}

    @Post()
    async handle(@Body(bodyValidationPipe) body: CreatePublisherBodySchema) {
        const { name } = body;

        const result = await this.createPublisher.execute({
            name,
        });

        if (result.isLeft()) {
            const error = result.value;

            switch (error.constructor) {
                case PublisherAlreadyExistsError:
                    throw new ConflictException(error.message);
                default:
                    throw new BadRequestException();
            }
        }
    }
}
