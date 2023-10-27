import { Entity } from '@shared/entities/base-entity';

interface PublisherProps {
    name: string;
}

export class Publisher extends Entity<PublisherProps> {
    get name(): string {
        return this.props.name;
    }

    public changeName(name: string): void {
        this.props.name = name;
        this.touch();
    }
}
