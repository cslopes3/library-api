import { Author } from '@domain/entities/author';
import { AuthorsRepository } from '@repository/authors-repository';
import { Injectable } from '@nestjs/common';
import {
    CreateAuthorInputDto,
    CreateAuthorOutputDto,
} from './create-author-dto';
import { Either, right } from '@shared/errors/either';

@Injectable()
export class CreateAuthorUseCase {
    constructor(private authorsRepository: AuthorsRepository) {}

    async execute({
        name,
    }: CreateAuthorInputDto): Promise<Either<null, CreateAuthorOutputDto>> {
        const author = new Author({ name });

        await this.authorsRepository.create(author);

        return right({
            id: author.id.toString(),
            name: author.name,
            createdAt: author.createdAt,
            updatedAt: author.updatedAt,
        });
    }
}
