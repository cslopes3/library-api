export class ExpiredDateError extends Error {
    constructor() {
        super(`User has a reservation with an expired date.`);
    }
}
