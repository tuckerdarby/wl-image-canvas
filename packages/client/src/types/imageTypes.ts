export interface IImageProperties {
    x: number;
    y: number;
    width: number;
    height: number;
    prompt: string;
    liked: boolean;
}

export interface IImage extends IImageProperties {
    id: string;
}
