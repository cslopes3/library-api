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
import { CreateAuthorUseCase } from '@usecase/create-author/create-author';
import { AuthorAlreadyExistsError } from '@usecase/@errors/author-already-exists-error';
import { Role } from '@infra/auth/role';
import { UserRole } from '@shared/utils/user-role';
import { RoleGuard } from '@infra/auth/role.guard';

const createAuthorBodySchema = z.object({
    name: z.string(),
});

type CreateAuthorBodySchema = z.infer<typeof createAuthorBodySchema>;

const bodyValidationPipe = new ZodValidationPipe(createAuthorBodySchema);

@Controller('/authors')
@Role(UserRole.ADMIN)
@UseGuards(RoleGuard)
export class CreateAuthorController {
    constructor(private createAuthor: CreateAuthorUseCase) {}

    @Post()
    async handle(@Body(bodyValidationPipe) body: CreateAuthorBodySchema) {
        const { name } = body;

        const result = await this.createAuthor.execute({
            name,
        });

        if (result.isLeft()) {
            const error = result.value;

            switch (error.constructor) {
                case AuthorAlreadyExistsError:
                    throw new ConflictException(error.message);
                default:
                    throw new BadRequestException();
            }
        }
    }
}
