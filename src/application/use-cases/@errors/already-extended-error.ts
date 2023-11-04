export class AlreadyExtendedError extends Error {
    constructor() {
        super(`A reservation can only be extended once`);
    }
}
