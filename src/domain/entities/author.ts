import { Entity } from '@shared/entities/base-entity';

interface AuthorProps {
    name: string;
}

export class Author extends Entity<AuthorProps> {
    get name(): string {
        return this.props.name;
    }

    public changeName(name: string): void {
        this.props.name = name;
        this.touch();
    }
}
