import { api } from "@/api/apiClient";
import { useSetImages } from "@/state/ImageContext";
import { useSetSelectedImageId } from "@/state/SelectedContext";
import { toast } from "sonner";

export const useDeleteAllImages = () => {
    const setImages = useSetImages();
    const setSelected = useSetSelectedImageId();

    return async () => {
        try {
            await api.deleteAllImages();
            setImages([]);
            setSelected(null);
        } catch (e) {
            toast(
                `There was an issue deleting all the images. Please try again.`
            );
        }
    };
};
