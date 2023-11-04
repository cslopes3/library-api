export class ReserveLimitError extends Error {
    constructor(numberOfBooksAlreadyReserved: number) {
        super(
            `User already reserved ${numberOfBooksAlreadyReserved} books. This reservation will exceeded hte limit.`,
        );
    }
}
