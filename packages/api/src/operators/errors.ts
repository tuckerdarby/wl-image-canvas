export class DatabaseError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "DatabaseError";
    }
}

export class NotFoundError extends DatabaseError {
    constructor(resource: string, id: string) {
        super(`${resource} with id ${id} not found`);
        this.name = "NotFoundError";
    }
}
