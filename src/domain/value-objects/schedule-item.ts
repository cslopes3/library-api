import { UniqueId } from '@shared/value-object/unique-id';

export class ScheduleItem {
    private _id: UniqueId;
    private _bookId: string;
    private _name: string;

    constructor(bookId: string, name: string, id?: string) {
        this._bookId = bookId;
        this._name = name;
        this._id = new UniqueId(id);
    }

    get id(): UniqueId {
        return this._id;
    }

    get bookId(): string {
        return this._bookId;
    }

    get name(): string {
        return this._name;
    }
}
