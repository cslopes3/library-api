import { randomUUID } from 'node:crypto';

export class UniqueId {
    private _id: string;

    constructor(id?: string) {
        this._id = id ?? randomUUID();
    }

    toString(): string {
        return this._id;
    }
}
