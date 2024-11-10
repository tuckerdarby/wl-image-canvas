import { MemoryDatabaseOperator } from "./memoryOperator";
import { DynamoDBOperator } from "./dynamoOperator";
import { IDatabaseOperator } from "./types";

export const getOperator = (): IDatabaseOperator => {
    const environment = process.env.NODE_ENV || "development";

    switch (environment) {
        case "production":
            const tableName = process.env.DYNAMODB_TABLE_NAME!;
            return DynamoDBOperator.getInstance(tableName);
        case "development":
        default:
            return MemoryDatabaseOperator.getInstance();
    }
};
