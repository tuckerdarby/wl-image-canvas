import { api } from "@/api/apiClient";
import {
    IMAGE_HEIGHT,
    IMAGE_WIDTH,
    INIT_IMAGE_X,
    INIT_IMAGE_Y,
} from "@/constants";
import { useAddImage } from "@/state/ImageContext";

export const useCreateImage = () => {
    const addImage = useAddImage();

    const createImageApi = async (prompt: string) => {
        const imageResult = await api.createImage(prompt);

        addImage({
            id: imageResult.id,
            currentPrompt: prompt,
            x: INIT_IMAGE_X,
            y: INIT_IMAGE_Y,
            width: IMAGE_WIDTH,
            height: IMAGE_HEIGHT,
        });
    };

    return createImageApi;
};
