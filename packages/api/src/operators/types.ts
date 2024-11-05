import { IImageModel } from "@wl-image-canvas/types";

export interface IDatabaseOperator {
    create(data: Omit<IImageModel, "id">): Promise<IImageModel>;
    get(id: string): Promise<IImageModel | null>;
    list(): Promise<IImageModel[]>;
    delete(id: string): Promise<boolean>;
}
