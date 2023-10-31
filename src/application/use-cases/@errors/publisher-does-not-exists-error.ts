export class PublisherDoesNotExistsError extends Error {
    constructor() {
        super(`Publisher does not exists.`);
    }
}
