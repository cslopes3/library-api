import { Publisher } from '@domain/entities/publisher';

export class FakePublisherFactory {
    static create(options?: Partial<Publisher>, id?: string): Publisher {
        const publisherDefaultValues = {
            name: 'Publisher 1',
        };

        return new Publisher(
            { ...publisherDefaultValues, ...options },
            id ?? '1',
        );
    }
}
