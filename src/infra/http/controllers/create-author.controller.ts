import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { ZodValidationPipe } from '@infra/http/pipes/zod-validation-pipe';
import { z } from 'zod';
import { CreateAuthorUseCase } from '@usecase/create-author/create-author';

const createAuthorBodySchema = z.object({
    name: z.string(),
});

type CreateAuthorBodySchema = z.infer<typeof createAuthorBodySchema>;

const bodyValidationPipe = new ZodValidationPipe(createAuthorBodySchema);

@Controller('/authors')
export class CreateAuthorController {
    constructor(private createAuthor: CreateAuthorUseCase) {}

    @Post()
    async handle(@Body(bodyValidationPipe) body: CreateAuthorBodySchema) {
        const { name } = body;

        const result = await this.createAuthor.execute({
            name,
        });

        if (result.isLeft()) {
            throw new BadRequestException();
        }
    }
}