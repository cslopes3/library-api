export class CantRemoveFromStockError extends Error {
    constructor() {
        super(
            `Can't remove a amount of books that is bigger than the current amount or bigger than the available quantity.`,
        );
    }
}
