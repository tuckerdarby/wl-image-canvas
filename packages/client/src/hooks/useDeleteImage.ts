import { api, ApiError } from "@/api/apiClient";
import { useRemoveImage } from "@/state/ImageContext";
import {
    useSelectedImageId,
    useSetSelectedImageId,
} from "@/state/SelectedContext";
import { ImageType } from "@/types/imageTypes";
import { toast } from "sonner";

export const useDeleteImage = () => {
    const removeImage = useRemoveImage();
    const selectedId = useSelectedImageId();
    const setSelected = useSetSelectedImageId();

    const unselect = (image: ImageType) => {
        if (selectedId === image.id) {
            setSelected(null);
        }
    };

    return async (image: ImageType) => {
        try {
            await api.deleteImage(image.id);
            removeImage(image.id);
            unselect(image);
        } catch (e) {
            if (!(e instanceof ApiError) || e.status !== 404) {
                toast(
                    `There was an issue deleting the image. Please try again.`
                );
            } else {
                removeImage(image.id);
                unselect(image);
            }
        }
    };
};
