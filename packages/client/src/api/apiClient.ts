import { IImageModel } from "@wl-image-canvas/types";

const API_URL = import.meta.env.VITE_API_URL;

export class ApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
        super(message);
        this.name = "ApiError";
        this.status = status;
    }
}

async function apiClient<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_URL}${endpoint}`;

    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    const response = await fetch(url, {
        ...options,
        headers,
        credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
        throw new ApiError(response.status, data.error || "An error occurred");
    }

    return data as T;
}

export const api = {
    listImages: (): Promise<{ images: IImageModel[] }> =>
        apiClient<{ images: IImageModel[] }>("/image/list", {
            method: "GET",
        }),

    createImage: (prompt: string): Promise<IImageModel> =>
        apiClient<IImageModel>("/image/create", {
            method: "POST",
            body: JSON.stringify({
                prompt,
            }),
        }),

    duplicateImage: (imageId: string): Promise<IImageModel> =>
        apiClient<IImageModel>("/image/duplicate", {
            method: "POST",
            body: JSON.stringify({
                imageId,
            }),
        }),

    createImageVariation: (
        prompt: string,
        variationCount: number
    ): Promise<{ images: IImageModel[] }> =>
        apiClient<{ images: IImageModel[] }>("/image/variation", {
            method: "POST",
            body: JSON.stringify({
                prompt,
                variationCount,
            }),
        }),

    updateImage: (imageId: string, prompt: string): Promise<IImageModel> =>
        apiClient<IImageModel>("/image/update", {
            method: "PUT",
            body: JSON.stringify({
                imageId,
                prompt,
            }),
        }),

    likeImage: (imageId: string, liked: boolean): Promise<IImageModel> =>
        apiClient<IImageModel>("/image/like", {
            method: "PUT",
            body: JSON.stringify({
                imageId,
                liked,
            }),
        }),

    deleteImage: (imageId: string): Promise<IImageModel> =>
        apiClient<IImageModel>("/image/delete", {
            method: "DELETE",
            body: JSON.stringify({
                imageId,
            }),
        }),
    deleteAllImages: (): Promise<IImageModel> =>
        apiClient<IImageModel>("/image/clear", {
            method: "DELETE",
        }),
};
