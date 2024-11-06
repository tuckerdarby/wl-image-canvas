import { api } from "@/api/apiClient";
import { useLoadImage, useUpdateImage } from "@/state/ImageContext";
import { IImage } from "@/types/imageTypes";

export const useUpdateImagePrompt = () => {
    const updateImage = useUpdateImage();
    const loadImage = useLoadImage();

    return async (image: IImage, prompt: string) => {
        const nextCounter = image.imageCounter + 1;
        updateImage(image.refId, { prompt, imageCounter: nextCounter });
        const imageData = await api.updateImage(image.imageData.id, prompt);
        loadImage(image.refId, imageData, nextCounter);
    };
};
