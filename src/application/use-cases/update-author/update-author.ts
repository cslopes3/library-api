import { AuthorsRepository } from '@repository/authors-repository';
import {
    UpdateAuthorInputDto,
    UpdateAuthorOutputDto,
} from './update-author-dto';
import { Either, left, right } from '@shared/errors/either';
import { ResourceNotFoundError } from '@usecase/@errors/resource-not-found-error';

export class UpdateAuthorUseCase {
    constructor(private authorsRepository: AuthorsRepository) {}

    async execute({
        id,
        name,
    }: UpdateAuthorInputDto): Promise<
        Either<ResourceNotFoundError, UpdateAuthorOutputDto | null>
    > {
        const author = await this.authorsRepository.findById(id);

        if (!author) {
            return left(new ResourceNotFoundError());
        }

        author.changeName(name);

        this.authorsRepository.update(author);

        return right({
            id: author.id.toString(),
            name: author.name,
            createdAt: author.createdAt,
            updatedAt: author.updatedAt,
        });
    }
}
