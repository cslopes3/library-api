export class ScheduleDeadlineError extends Error {
    constructor() {
        super(`The schedule cannot exceed the limit of 5 working days`);
    }
}
