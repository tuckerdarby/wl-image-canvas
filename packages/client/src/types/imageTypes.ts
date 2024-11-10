import { IImageModel } from "@wl-image-canvas/types";

export interface IImageProperties {
    x: number;
    y: number;
    width: number;
    height: number;
    id: string;
    currentPrompt?: string;
    liked?: boolean;
}

export interface IImage extends IImageProperties {
    imageData?: IImageModel;
}

export type ImageType = IImage;
