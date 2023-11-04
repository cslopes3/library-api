import { User } from '@domain/entities/user';

export abstract class UsersRepository {
    abstract findById(id: string): Promise<User | null>;
    abstract findByEmail(email: string): Promise<User | null>;
    abstract create(user: User): Promise<void>;
}
