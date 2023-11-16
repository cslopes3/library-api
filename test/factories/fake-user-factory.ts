import { User } from '@domain/entities/user';

export class FakeUserFactory {
    static create(options?: Partial<User>, id?: string): User {
        const userDefaultValues = {
            name: 'User 1',
            email: 'user1@example.com',
            password: '123456',
        };

        return new User({ ...userDefaultValues, ...options }, id ?? '1');
    }
}
