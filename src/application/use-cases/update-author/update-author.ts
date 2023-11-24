import { AuthorsRepository } from '@repository/authors-repository';
import {
    UpdateAuthorInputDto,
    UpdateAuthorOutputDto,
} from './update-author-dto';
import { Either, left, right } from '@shared/errors/either';
import { ResourceNotFoundError } from '@usecase/@errors/resource-not-found-error';
import { AuthorAlreadyExistsError } from '@usecase/@errors/author-already-exists-error';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UpdateAuthorUseCase {
    constructor(private authorsRepository: AuthorsRepository) {}

    async execute({
        id,
        name,
    }: UpdateAuthorInputDto): Promise<
        Either<
            ResourceNotFoundError | AuthorAlreadyExistsError,
            UpdateAuthorOutputDto
        >
    > {
        const author = await this.authorsRepository.findById(id);

        if (!author) {
            return left(new ResourceNotFoundError());
        }

        const authorWithSameName =
            await this.authorsRepository.findByName(name);

        if (
            authorWithSameName &&
            authorWithSameName.id.toString() !== author.id.toString()
        ) {
            return left(new AuthorAlreadyExistsError(name));
        }

        author.changeName(name);

        await this.authorsRepository.update(author);

        return right({
            id: author.id.toString(),
            name: author.name,
            createdAt: author.createdAt,
            updatedAt: author.updatedAt,
        });
    }
}
