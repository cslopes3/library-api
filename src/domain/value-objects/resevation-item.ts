import { UniqueId } from '@shared/value-object/unique-id';

export class ReservationItem {
    private _id: UniqueId;
    private _bookId: string;
    private _name: string;
    private _expirationDate: Date;
    private _alreadyExtendTime: boolean;
    private _returned: boolean;
    private _returnDate?: Date;

    constructor(
        bookId: string,
        name: string,
        expirationDate: Date,
        alreadyExtendTime: boolean,
        returned: boolean,
        id?: string,
        returnDate?: Date,
    ) {
        this._bookId = bookId;
        this._name = name;
        this._expirationDate = expirationDate;
        this._alreadyExtendTime = alreadyExtendTime;
        this._returned = returned || false;
        this._id = new UniqueId(id);
        this._returnDate = returnDate;
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

    get expirationDate(): Date {
        return this._expirationDate;
    }

    get alreadyExtendTime(): boolean {
        return this._alreadyExtendTime;
    }

    get returnDate(): Date | undefined {
        return this._returnDate;
    }

    get returned(): boolean {
        return this._returned;
    }

    public changeReturnRecord(returnDate: Date, returned: boolean) {
        this._returnDate = returnDate;
        this._returned = returned;
    }

    public changeExpirationDate(expirationDate: Date) {
        this._expirationDate = expirationDate;
    }

    public changeAlreadyExtendTime(alreadyExtendTime: boolean) {
        this._alreadyExtendTime = alreadyExtendTime;
    }
}
