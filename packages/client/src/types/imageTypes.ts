import { IImageModel } from "@wl-image-canvas/types";

export interface IImageProperties {
    x: number;
    y: number;
    width: number;
    height: number;
    refId: string;
    imageCounter: number;
    prompt: string;
}

export interface IImage extends IImageProperties {
    imageData: IImageModel;
    loading: false;
}

export interface IImageLoading extends IImageProperties {
    loading: true;
}

export type ImageType = IImage | IImageLoading;
