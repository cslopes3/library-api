import { AuthorsRepository } from '@repository/authors-repository';
import { DeleteAuthorInputDto } from './delete-author-dto';
import { Either, left, right } from '@shared/errors/either';
import { ResourceNotFoundError } from '@usecase/@errors/resource-not-found-error';

export class DeleteAuthorUseCase {
    constructor(private authorsRepository: AuthorsRepository) {}

    async execute({
        id,
    }: DeleteAuthorInputDto): Promise<Either<ResourceNotFoundError, null>> {
        const author = await this.authorsRepository.findById(id);

        if (!author) {
            return left(new ResourceNotFoundError());
        }

        return right(null);
    }
}
