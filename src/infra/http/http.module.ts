import { Module } from '@nestjs/common';
import { CreateAccountController } from '@infra/http/controllers/create-account.controller';
import { CreateAuthorController } from '@infra/http/controllers/create-author.controller';
import { FindManyAuthorsController } from '@infra/http/controllers/find-many-authors.controller';
import { AuthenticateController } from '@infra/http/controllers/authenticate-controller';
import { DatabaseModule } from '@infra/database/prisma/database.module';
import { CreateAuthorUseCase } from '@usecase/create-author/create-author';
import { FindManyAuthorsUseCase } from '@usecase/find-many-author/find-many-authors';
import { CryptographyModule } from '@infra/cryptography/cryptography.module';
import { RegisterUserUseCase } from '@usecase/register-user/register-user';
import { AuthenticateUserUseCase } from '@usecase/authenticate-user/authenticate-user';

@Module({
    imports: [DatabaseModule, CryptographyModule],
    controllers: [
        AuthenticateController,
        CreateAccountController,
        CreateAuthorController,
        FindManyAuthorsController,
    ],
    providers: [
        CreateAuthorUseCase,
        FindManyAuthorsUseCase,
        RegisterUserUseCase,
        AuthenticateUserUseCase,
    ],
})
export class HttpModule {}
