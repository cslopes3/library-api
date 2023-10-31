export class BookAlreadyExistsError extends Error {
    constructor(identifier: string) {
        super(`Book "${identifier}" already exists.`);
    }
}
