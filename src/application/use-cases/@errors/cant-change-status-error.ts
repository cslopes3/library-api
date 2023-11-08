export class CantChangeStatusError extends Error {
    constructor() {
        super(`Can not change the status of this schedule.`);
    }
}
