import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const createRefId = () =>
    `ref_${Date.now()}_${Math.random().toString(36).slice(2)}`;
