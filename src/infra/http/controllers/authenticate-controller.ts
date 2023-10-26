import {
    BadRequestException,
    Body,
    Controller,
    Post,
    UnauthorizedException,
    UsePipes,
} from '@nestjs/common';
import { ZodValidationPipe } from '@infra/http/pipes/zod-validation-pipe';
import { z } from 'zod';
import { AuthenticateUserUseCase } from '@usecase/authenticate-user/authenticate-user';
import { Public } from '@infra/auth/public';
import { WrongCredentialsError } from '@usecase/@errors/wrong-credentials-error';

const authenticateBodySchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

type AuthenticateBodySchema = z.infer<typeof authenticateBodySchema>;

@Controller('/sessions')
@Public()
export class AuthenticateController {
    constructor(private authenticateUser: AuthenticateUserUseCase) {}

    @Post()
    @UsePipes(new ZodValidationPipe(authenticateBodySchema))
    async handle(@Body() body: AuthenticateBodySchema) {
        const { email, password } = body;

        const result = await this.authenticateUser.execute({
            email,
            password,
        });

        if (result.isLeft()) {
            const error = result.value;

            switch (error.constructor) {
                case WrongCredentialsError:
                    throw new UnauthorizedException(error.message);
                default:
                    throw new BadRequestException(error.message);
            }
        }

        const { accessToken } = result.value;

        return {
            access_token: accessToken,
        };
    }
}
