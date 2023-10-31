export class AuthorDoesNotExistsError extends Error {
    constructor() {
        super(`Author does not exists.`);
    }
}
