import { PublishersRepository } from '@repository/publishers-repository';
import { DeletePublisherInputDto } from './delete-publisher-dto';
import { Either, left, right } from '@shared/errors/either';
import { ResourceNotFoundError } from '@usecase/@errors/resource-not-found-error';

export class DeletePublisherUseCase {
    constructor(private publishersRepository: PublishersRepository) {}

    async execute({
        id,
    }: DeletePublisherInputDto): Promise<Either<ResourceNotFoundError, null>> {
        const publisher = await this.publishersRepository.findById(id);

        if (!publisher) {
            return left(new ResourceNotFoundError());
        }

        await this.publishersRepository.delete(id);

        return right(null);
    }
}
