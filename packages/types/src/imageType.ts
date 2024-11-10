export interface IImageModel {
    id: string;
    userId: string;
    prompt?: string;
    imageUrl?: string;
    liked: boolean;
}
