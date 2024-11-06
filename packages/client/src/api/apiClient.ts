import { IImageModel } from "@wl-image-canvas/types";

const API_URL = import.meta.env.VITE_API_URL;

export class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = "ApiError";
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
    get: <T>(endpoint: string, options?: RequestInit) =>
        apiClient<T>(endpoint, { ...options, method: "GET" }),

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

    createImageVariation: (prompt: string): Promise<IImageModel> =>
        apiClient<IImageModel>("/image/duplicate", {
            method: "POST",
            body: JSON.stringify({
                prompt,
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

    deleteImage: (imageId: string): Promise<IImageModel> =>
        apiClient<IImageModel>("/image/delete", {
            method: "DELETE",
            body: JSON.stringify({
                imageId,
            }),
        }),
};
