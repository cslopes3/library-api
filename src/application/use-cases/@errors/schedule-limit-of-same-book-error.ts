export class ScheduleLimitOfSameBookError extends Error {
    constructor(books: string[]) {
        super(
            `User already schedule 2 or more times of same book: ${books.toString()}`,
        );
    }
}
