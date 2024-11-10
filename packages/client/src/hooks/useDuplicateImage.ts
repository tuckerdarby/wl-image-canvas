import { api } from "@/api/apiClient";
import { DUPLICATE_DIFF_X, DUPLICATE_DIFF_Y } from "@/constants";
import { useAddImage } from "@/state/ImageContext";
import { IImage, ImageType } from "@/types/imageTypes";
import { toast } from "sonner";

export const useDuplicateImage = () => {
    const addImage = useAddImage();

    const duplicateImage = async (image: IImage) => {
        if (!image.imageData) {
            toast("Images can only be duplicated for initialized images.");
        }
        try {
            const newX = image.x + DUPLICATE_DIFF_X;
            const newY = image.y + DUPLICATE_DIFF_Y;

            const duplicateImageData = await api.duplicateImage(image.id);

            const duplicate: ImageType = {
                ...image,
                id: duplicateImageData.id,
                x: newX,
                y: newY,
                imageData: duplicateImageData,
            };

            addImage(duplicate);
        } catch (e) {
            toast(
                "There was an issue duplicating the image. Please try again later."
            );
        }
    };
    return duplicateImage;
};
