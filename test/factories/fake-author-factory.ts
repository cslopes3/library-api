import { Author } from '@domain/entities/author';

export class FakeAuthorFactory {
    static create(options?: Partial<Author>, id?: string): Author {
        const authorDefaultValues = {
            name: 'Author 1',
        };

        return new Author({ ...authorDefaultValues, ...options }, id ?? '1');
    }
}
