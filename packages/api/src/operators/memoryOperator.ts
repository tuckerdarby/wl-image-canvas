import { IImageModel } from "@wl-image-canvas/types";
import { NotFoundError } from "./errors";
import { IDatabaseOperator } from "./types";

// for Dev use
export class MemoryDatabaseOperator implements IDatabaseOperator {
    private static instance: MemoryDatabaseOperator;
    private storage: Map<string, IImageModel>;

    private constructor() {
        this.storage = new Map<string, IImageModel>();
    }

    public static getInstance(): MemoryDatabaseOperator {
        if (!MemoryDatabaseOperator.instance) {
            MemoryDatabaseOperator.instance = new MemoryDatabaseOperator();
        }
        return MemoryDatabaseOperator.instance;
    }

    public async get(id: string): Promise<IImageModel> {
        console.log(this.storage.keys());
        const image = this.storage.get(id);
        if (!image) {
            throw new NotFoundError("Image", id);
        }
        return image;
    }

    public async update(
        id: string,
        prompt: string,
        imageUrl: string
    ): Promise<IImageModel> {
        const image = this.storage.get(id);
        if (!image) {
            throw new NotFoundError("Image", id);
        }
        const newImage = {
            ...image,
            imageUrl,
            prompt,
        };
        this.storage.set(id, newImage);
        return newImage;
    }

    public async list(): Promise<IImageModel[]> {
        return Array.from(this.storage.values());
    }

    public async create(data: Omit<IImageModel, "id">): Promise<IImageModel> {
        const id = crypto.randomUUID();
        const image: IImageModel = {
            id: id,
            ...data,
        };
        this.storage.set(id, image);
        return image;
    }

    public async delete(id: string): Promise<boolean> {
        if (this.storage.has(id)) {
            this.storage.delete(id);
            return true;
        }
        throw new NotFoundError("Image", id);
    }
}
