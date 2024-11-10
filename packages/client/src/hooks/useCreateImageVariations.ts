import { api } from "@/api/apiClient";
import { NUM_VARIATIONS, VARIATION_DIFFS } from "@/constants";
import { useAddImage } from "@/state/ImageContext";
import { IImage, ImageType } from "@/types/imageTypes";
import { toast } from "sonner";

export const useCreateImageVariations = () => {
    const addImage = useAddImage();

    const createImageVariations = async (image: ImageType) => {
        const currentPrompt = image.currentPrompt;
        if (!currentPrompt) {
            toast(
                "Image variations can only be created for initialized images."
            );
            return;
        }
        try {
            const numVariations = NUM_VARIATIONS;

            const imageVariationsData = await api.createImageVariation(
                currentPrompt,
                numVariations
            );

            const variations: IImage[] = imageVariationsData.images.map(
                (variation, idx) => ({
                    ...variation,
                    width: image.width,
                    height: image.height,
                    x: image.x + VARIATION_DIFFS[idx][0],
                    y: image.y + VARIATION_DIFFS[idx][1],
                })
            );

            variations.forEach((variation) => {
                addImage(variation);
            });
        } catch (e) {
            toast(
                "There was an issue creating image variations. Please try again later."
            );
        }
    };
    return createImageVariations;
};
