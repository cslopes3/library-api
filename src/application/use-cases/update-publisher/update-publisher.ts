import { PublishersRepository } from '@repository/publishers-repository';
import {
    UpdatePublisherInputDto,
    UpdatePublisherOutputDto,
} from './update-publisher-dto';
import { Either, left, right } from '@shared/errors/either';
import { ResourceNotFoundError } from '@usecase/@errors/resource-not-found-error';

export class UpdatePublisherUseCase {
    constructor(private publishersRepository: PublishersRepository) {}

    async execute({
        id,
        name,
    }: UpdatePublisherInputDto): Promise<
        Either<ResourceNotFoundError, UpdatePublisherOutputDto | null>
    > {
        const publisher = await this.publishersRepository.findById(id);

        if (!publisher) {
            return left(new ResourceNotFoundError());
        }

        publisher.changeName(name);

        this.publishersRepository.update(publisher);

        return right({
            id: publisher.id.toString(),
            name: publisher.name,
            createdAt: publisher.createdAt,
            updatedAt: publisher.updatedAt,
        });
    }
}
