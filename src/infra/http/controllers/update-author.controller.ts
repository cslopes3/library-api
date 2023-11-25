import { UpdateAuthorUseCase } from '@usecase/update-author/update-author';
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
import { AuthorAlreadyExistsError } from '@usecase/@errors/author-already-exists-error';
import { Role } from '@infra/auth/role';
import { UserRole } from '@shared/utils/user-role';
import { RoleGuard } from '@infra/auth/role.guard';

const updateAuthorBodySchema = z.object({
    name: z.string(),
});

type UpdateAuthorBodySchema = z.infer<typeof updateAuthorBodySchema>;

const bodyValidationPipe = new ZodValidationPipe(updateAuthorBodySchema);

@Controller('/authors/:id')
@Role(UserRole.ADMIN)
@UseGuards(RoleGuard)
export class UpdateAuthorController {
    constructor(private updateAuthor: UpdateAuthorUseCase) {}

    @Put()
    @HttpCode(204)
    async handle(
        @Body(bodyValidationPipe) body: UpdateAuthorBodySchema,
        @Param('id') authorId: string,
    ) {
        const { name } = body;

        const result = await this.updateAuthor.execute({ id: authorId, name });

        if (result.isLeft()) {
            const error = result.value;

            switch (error.constructor) {
                case ResourceNotFoundError:
                    throw new NotFoundException(error.message);
                case AuthorAlreadyExistsError:
                    throw new ConflictException(error.message);
                default:
                    throw new BadRequestException();
            }
        }
    }
}
