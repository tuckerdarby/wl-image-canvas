import { IImageModel } from "@wl-image-canvas/types";

export interface IDatabaseOperator {
    create(data: Omit<IImageModel, "id">): Promise<IImageModel>;
    get(id: string): Promise<IImageModel>;
    list(): Promise<IImageModel[]>;
    delete(id: string): Promise<boolean>;
    update(id: string, prompt: string, imageUrl: string): Promise<IImageModel>;
}
