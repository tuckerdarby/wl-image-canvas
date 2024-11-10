import { IImageModel } from "@wl-image-canvas/types";

export interface IDatabaseOperator {
    create(data: Omit<IImageModel, "id">): Promise<IImageModel>;
    createMultiple(data: Omit<IImageModel, "id">[]): Promise<IImageModel[]>;
    get(id: string): Promise<IImageModel>;
    list(): Promise<IImageModel[]>;
    delete(id: string): Promise<boolean>;
    update(
        id: string,
        data: Partial<Omit<IImageModel, "id" | "userId">>
    ): Promise<IImageModel>;
    set(image: IImageModel): Promise<boolean>;
    deleteAll(userId: string): Promise<boolean>;
}
