export class BookEdition {
    private _number: number;
    private _description: string;
    private _year: number;

    constructor(number: number, description: string, year: number) {
        this._number = number;
        this._description = description;
        this._year = year;
    }

    get number(): number {
        return this._number;
    }

    get description(): string {
        return this._description;
    }

    get year(): number {
        return this._year;
    }
}
