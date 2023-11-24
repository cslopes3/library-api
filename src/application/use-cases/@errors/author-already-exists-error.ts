export class AuthorAlreadyExistsError extends Error {
    constructor(identifier: string) {
        super(`Author ${identifier} already exists.`);
    }
}
