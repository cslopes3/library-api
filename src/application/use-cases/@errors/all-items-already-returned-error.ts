export class AllItemsAlreadyReturnedError extends Error {
    constructor() {
        super(`All items are already returned.`);
    }
}
