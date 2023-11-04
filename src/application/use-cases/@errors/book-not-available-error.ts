export class BookNotAvailableError extends Error {
    constructor(nameOfBooks: string[]) {
        super(`One or more books are unavailable: ${nameOfBooks.toString()}`);
    }
}
