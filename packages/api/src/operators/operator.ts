import { MemoryDatabaseOperator } from "./memoryOperator";
import { IDatabaseOperator } from "./types";

export class DatabaseFactory {
    static getOperator(): IDatabaseOperator {
        const environment = process.env.NODE_ENV || "development";

        switch (environment) {
            case "production":
                return MemoryDatabaseOperator.getInstance(); // TODO change
            case "development":
            default:
                return MemoryDatabaseOperator.getInstance();
        }
    }
}
