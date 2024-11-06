import { api } from "@/api/apiClient";
import { createRefId } from "@/lib/utils";
import { useAddImage } from "@/state/ImageContext";
import { IImage, ImageType } from "@/types/imageTypes";

export const useDuplicateImage = () => {
    const addImage = useAddImage();

    const duplicateImage = async (image: IImage) => {
        const newRefId = createRefId();

        // TODO move to constants
        const newX = image.x + 50;
        const newY = image.y + 50;

        const duplicateImageData = await api.duplicateImage(image.imageData.id);

        const duplicate: ImageType = {
            ...image,
            x: newX,
            y: newY,
            refId: newRefId,
            imageData: duplicateImageData,
        };

        addImage(duplicate);
    };
    return duplicateImage;
};
