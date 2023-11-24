import { PublishersRepository } from '@repository/publishers-repository';
import {
    FindPublisherByIdInputDto,
    FindPublisherByIdOutputDto,
} from './find-publisher-by-id-dto';
import { Either, right } from '@shared/errors/either';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FindPublisherByIdUseCase {
    constructor(private publishersRepository: PublishersRepository) {}

    async execute({
        id,
    }: FindPublisherByIdInputDto): Promise<
        Either<null, FindPublisherByIdOutputDto | null>
    > {
        const publisher = await this.publishersRepository.findById(id);

        if (!publisher) {
            return right(null);
        }

        return right({
            id: publisher.id.toString(),
            name: publisher.name,
            createdAt: publisher.createdAt,
            updatedAt: publisher.updatedAt,
        });
    }
}
