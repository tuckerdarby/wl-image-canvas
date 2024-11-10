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
        const image = this.storage.get(id);
        if (!image) {
            throw new NotFoundError("Image", id);
        }
        return image;
    }

    public async update(
        id: string,
        data: Partial<Omit<IImageModel, "id" | "userId">>
    ): Promise<IImageModel> {
        const image = this.storage.get(id);
        if (!image) {
            throw new NotFoundError("Image", id);
        }
        const newImage = {
            ...image,
            ...data,
        };
        this.storage.set(id, newImage);
        return newImage;
    }

    public async set(image: IImageModel): Promise<boolean> {
        const currentImage = this.storage.get(image.id);
        if (!currentImage) {
            throw new NotFoundError("Image", image.id);
        }
        if (currentImage.prompt === image.prompt) {
            this.storage.set(image.id, image);
            return true;
        }
        return false;
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

    public async createMultiple(
        data: Omit<IImageModel, "id">[]
    ): Promise<IImageModel[]> {
        const images = data.map((imageData) => {
            const id = crypto.randomUUID();
            const image: IImageModel = {
                id: id,
                ...imageData,
            };
            return image;
        });

        images.forEach((image) => {
            this.storage.set(image.id, image);
        });
        return images;
    }

    public async delete(id: string): Promise<boolean> {
        if (this.storage.has(id)) {
            this.storage.delete(id);
            return true;
        }
        return false;
    }

    public async deleteAll(userId: string): Promise<boolean> {
        this.storage = new Map<string, IImageModel>();
        return true;
    }
}
