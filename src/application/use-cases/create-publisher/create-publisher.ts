import { Publisher } from '@domain/entities/publisher';
import { PublishersRepository } from '@repository/publishers-repository';
import { Injectable } from '@nestjs/common';
import {
    CreatePublisherInputDto,
    CreatePublisherOutputDto,
} from './create-publisher-dto';
import { Either, left, right } from '@shared/errors/either';
import { PublisherAlreadyExistsError } from '@usecase/@errors/publisher-already-exists-error';

@Injectable()
export class CreatePublisherUseCase {
    constructor(private publishersRepository: PublishersRepository) {}

    async execute({
        name,
    }: CreatePublisherInputDto): Promise<
        Either<PublisherAlreadyExistsError, CreatePublisherOutputDto>
    > {
        const publisherWithSameName =
            await this.publishersRepository.findByName(name);

        if (publisherWithSameName) {
            return left(new PublisherAlreadyExistsError(name));
        }

        const publisher = new Publisher({ name });

        await this.publishersRepository.create(publisher);

        return right({
            id: publisher.id.toString(),
            name: publisher.name,
            createdAt: publisher.createdAt,
            updatedAt: publisher.updatedAt,
        });
    }
}
