import { api } from "@/api/apiClient";
import { createRefId } from "@/lib/utils";
import {
    useAddImage,
    useLoadImage,
    useRemoveImage,
} from "@/state/ImageContext";

export const useCreateImage = () => {
    const addImage = useAddImage();
    const loadImage = useLoadImage();
    const removeImage = useRemoveImage();

    const createImageApi = async (prompt: string) => {
        const refId = createRefId();
        addImage({
            refId,
            prompt,
            loading: true,
            x: 100,
            y: 100,
            width: 150,
            height: 150, // TODO make these constants
            imageCounter: 0,
        });
        try {
            const imageResult = await api.createImage(prompt);
            loadImage(refId, imageResult, 0);
        } catch (e) {
            removeImage(refId);
        }
    };

    return createImageApi;
};
