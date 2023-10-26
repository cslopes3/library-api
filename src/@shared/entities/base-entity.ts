import { UniqueId } from '@shared/value-object/unique-id';

export class Entity<Props> {
    private _id: UniqueId;
    private _createdAt: Date;
    private _updatedAt: Date;
    protected props: Props;

    constructor(props: Props, id?: string, createdAt?: Date, updatedAt?: Date) {
        this.props = props;
        this._id = new UniqueId(id);
        this._createdAt = createdAt || new Date();
        this._updatedAt = updatedAt || new Date();
    }

    get id(): UniqueId {
        return this._id;
    }

    get createdAt(): Date {
        return this._createdAt;
    }

    get updatedAt(): Date {
        return this._updatedAt;
    }
}
