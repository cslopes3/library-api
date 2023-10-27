import { PublishersRepository } from '@repository/publishers-repository';
import {
    FindManyPublishersInputDto,
    FindManyPublishersOutputDto,
} from './find-many-publishers-dto';
import { Injectable } from '@nestjs/common';
import { Either, right } from '@shared/errors/either';

@Injectable()
export class FindManyPublishersUseCase {
    constructor(private publishersRepository: PublishersRepository) {}

    async execute({
        params,
    }: FindManyPublishersInputDto): Promise<
        Either<null, FindManyPublishersOutputDto[] | []>
    > {
        const Publishers = await this.publishersRepository.findMany({
            page: params.page,
        });

        return right(
            Publishers.map((publisher) => ({
                id: publisher.id.toString(),
                name: publisher.name,
                createdAt: publisher.createdAt,
                updatedAt: publisher.updatedAt,
            })),
        );
    }
}
