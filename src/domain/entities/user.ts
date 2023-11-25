import { Entity } from '@shared/entities/base-entity';
import { UserRole } from '@shared/utils/user-role';

interface UseProps {
    name: string;
    email: string;
    password: string;
    role: UserRole;
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

    get role(): UserRole {
        return this.props.role;
    }
}
