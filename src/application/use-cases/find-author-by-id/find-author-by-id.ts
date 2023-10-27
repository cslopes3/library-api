import { AuthorsRepository } from '@repository/authors-repository';
import {
    FindAuthorByIdInputDto,
    FindAuthorByIdOutputDto,
} from './find-author-by-id-dto';
import { Either, right } from '@shared/errors/either';

export class FindAuthorByIdUseCase {
    constructor(private authorsRepository: AuthorsRepository) {}

    async execute({
        id,
    }: FindAuthorByIdInputDto): Promise<
        Either<null, FindAuthorByIdOutputDto | null>
    > {
        const author = await this.authorsRepository.findById(id);

        if (!author) {
            return right(null);
        }

        return right({
            id: author.id.toString(),
            name: author.name,
            createdAt: author.createdAt,
            updatedAt: author.updatedAt,
        });
    }
}
