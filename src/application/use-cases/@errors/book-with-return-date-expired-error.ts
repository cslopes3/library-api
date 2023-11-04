export class BookWithReturnDateExpiredError extends Error {
    constructor() {
        super(
            `User can't reserve another book. A book with return date expired was found.`,
        );
    }
}
