import { Entity } from '@shared/entities/base-entity';

interface UseProps {
    name: string;
    email: string;
    password: string;
}

export class User extends Entity<UseProps> {
    get name(): string {
        return this.props.name;
    }

    get email(): string {
        return this.props.email;
    }

    get password(): string {
        return this.props.password;
    }
}
