import { Publisher } from '@domain/entities/publisher';
import { PublishersRepository } from '@repository/publishers-repository';
import { Injectable } from '@nestjs/common';
import {
    CreatePublisherInputDto,
    CreatePublisherOutputDto,
} from './create-publisher-dto';
import { Either, right } from '@shared/errors/either';

@Injectable()
export class CreatePublisherUseCase {
    constructor(private publishersRepository: PublishersRepository) {}

    async execute({
        name,
    }: CreatePublisherInputDto): Promise<
        Either<null, CreatePublisherOutputDto>
    > {
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
