export class PublisherAlreadyExistsError extends Error {
    constructor(identifier: string) {
        super(`Publisher ${identifier} already exists.`);
    }
}
