import type { IImage } from "@wl-image-canvas/types";

const API_URL = import.meta.env.VITE_API_URL;

export class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = "ApiError";
    }
}

export type Cake = IImage;

export async function apiClient<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_URL}${
        endpoint.startsWith("/") ? endpoint : `/${endpoint}`
    }`;

    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    const response = await fetch(url, {
        ...options,
        headers,
        credentials: "include", // Handles cookies if you're using session-based auth
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

    post: <T>(endpoint: string, body: unknown, options?: RequestInit) =>
        apiClient<T>(endpoint, {
            ...options,
            method: "POST",
            body: JSON.stringify(body),
        }),

    put: <T>(endpoint: string, body: unknown, options?: RequestInit) =>
        apiClient<T>(endpoint, {
            ...options,
            method: "PUT",
            body: JSON.stringify(body),
        }),

    delete: <T>(endpoint: string, options?: RequestInit) =>
        apiClient<T>(endpoint, { ...options, method: "DELETE" }),
};
