import { DynamoDB } from "aws-sdk";
import { IImageModel } from "@wl-image-canvas/types";
import { NotFoundError } from "./errors";
import { IDatabaseOperator } from "./types";

export class DynamoDBOperator implements IDatabaseOperator {
    private static instance: DynamoDBOperator;
    private readonly dynamoDB: DynamoDB.DocumentClient;
    private readonly tableName: string;

    private constructor(tableName: string) {
        this.dynamoDB = new DynamoDB.DocumentClient();
        this.tableName = tableName;
    }

    public static getInstance(tableName: string): DynamoDBOperator {
        if (!DynamoDBOperator.instance) {
            DynamoDBOperator.instance = new DynamoDBOperator(tableName);
        }
        return DynamoDBOperator.instance;
    }

    public async get(id: string): Promise<IImageModel> {
        const params = {
            TableName: this.tableName,
            Key: { id },
        };

        const result = await this.dynamoDB.get(params).promise();
        if (!result.Item) {
            throw new NotFoundError("Image", id);
        }
        return result.Item as IImageModel;
    }

    public async update(
        id: string,
        data: Partial<Omit<IImageModel, "id" | "userId">>
    ): Promise<IImageModel> {
        // First check if item exists
        await this.get(id);

        // Build update expression
        const updateExp = Object.keys(data).reduce((acc, key, index) => {
            if (index === 0) return `set ${key} = :${key}`;
            return `${acc}, ${key} = :${key}`;
        }, "");

        const expressionAttValues = Object.entries(data).reduce(
            (acc, [key, value]) => {
                acc[`:${key}`] = value;
                return acc;
            },
            {} as { [key: string]: any }
        );

        const params = {
            TableName: this.tableName,
            Key: { id },
            UpdateExpression: updateExp,
            ExpressionAttributeValues: expressionAttValues,
            ReturnValues: "ALL_NEW",
        };

        const result = await this.dynamoDB.update(params).promise();
        return result.Attributes as IImageModel;
    }

    public async set(image: IImageModel): Promise<boolean> {
        const currentImage = await this.get(image.id);

        if (currentImage.prompt === image.prompt) {
            const params = {
                TableName: this.tableName,
                Item: image,
            };
            await this.dynamoDB.put(params).promise();
            return true;
        }
        return false;
    }

    public async list(): Promise<IImageModel[]> {
        const params = {
            TableName: this.tableName,
        };

        const result = await this.dynamoDB.scan(params).promise();
        return (result.Items || []) as IImageModel[];
    }

    public async create(data: Omit<IImageModel, "id">): Promise<IImageModel> {
        const id = crypto.randomUUID();
        const image: IImageModel = {
            id,
            ...data,
        };

        const params = {
            TableName: this.tableName,
            Item: image,
        };

        await this.dynamoDB.put(params).promise();
        return image;
    }

    public async createMultiple(
        data: Omit<IImageModel, "id">[]
    ): Promise<IImageModel[]> {
        const images = data.map((imageData) => ({
            id: crypto.randomUUID(),
            ...imageData,
        }));

        // DynamoDB BatchWrite can only handle 25 items at a time
        const batchSize = 25;
        for (let i = 0; i < images.length; i += batchSize) {
            const batch = images.slice(i, i + batchSize);
            const params = {
                RequestItems: {
                    [this.tableName]: batch.map((image) => ({
                        PutRequest: {
                            Item: image,
                        },
                    })),
                },
            };
            await this.dynamoDB.batchWrite(params).promise();
        }

        return images;
    }

    public async delete(id: string): Promise<boolean> {
        const params = {
            TableName: this.tableName,
            Key: { id },
        };

        await this.dynamoDB.delete(params).promise();
        return true;
    }

    public async deleteAll(userId: string): Promise<boolean> {
        // Query all items for the user
        const params = {
            TableName: this.tableName,
            FilterExpression: "userId = :userId",
            ExpressionAttributeValues: {
                ":userId": userId,
            },
        };

        const result = await this.dynamoDB.scan(params).promise();
        if (!result.Items?.length) return true;

        // Delete items in batches
        const batchSize = 25;
        for (let i = 0; i < result.Items.length; i += batchSize) {
            const batch = result.Items.slice(i, i + batchSize);
            const deleteParams = {
                RequestItems: {
                    [this.tableName]: batch.map((item) => ({
                        DeleteRequest: {
                            Key: { id: item.id },
                        },
                    })),
                },
            };
            await this.dynamoDB.batchWrite(deleteParams).promise();
        }

        return true;
    }
}
