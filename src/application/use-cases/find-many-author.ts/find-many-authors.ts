import { AuthorsRepository } from '@repository/authors-repository';
import {
    FindManyAuthorsInputDto,
    FindManyAuthorsOutputDto,
} from './find-many-authors-dto';
import { Injectable } from '@nestjs/common';
import { Either, right } from '@shared/errors/either';

@Injectable()
export class FindManyAuthorsUseCase {
    constructor(private authorsRepository: AuthorsRepository) {}

    async execute({
        params,
    }: FindManyAuthorsInputDto): Promise<
        Either<null, FindManyAuthorsOutputDto[] | []>
    > {
        const authors = await this.authorsRepository.findMany({
            page: params.page,
        });

        return right(
            authors.map((author) => ({
                id: author.id.toString(),
                name: author.name,
                createdAt: author.createdAt,
                updatedAt: author.updatedAt,
            })),
        );
    }
}
