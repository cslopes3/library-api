export class BookDoesNotExistsError extends Error {
    constructor() {
        super(`Book does not exists.`);
    }
}
