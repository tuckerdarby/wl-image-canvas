import { api } from "@/api/apiClient";
import { useRemoveImage } from "@/state/ImageContext";
import { ImageType } from "@/types/imageTypes";

export const useDeleteImage = () => {
    const removeImage = useRemoveImage();
    return async (image: ImageType) => {
        // TODO error handling
        if (!image.loading) {
            await api.deleteImage(image.imageData.id);
        }
        removeImage(image.refId);
    };
};
