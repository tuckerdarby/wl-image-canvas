import { api } from "@/api/apiClient";
import { useUpdateImage } from "@/state/ImageContext";
import { ImageType } from "@/types/imageTypes";
import { useCallback } from "react";
import { toast } from "sonner";

export const useLikeImage = () => {
    const updateImage = useUpdateImage();

    return useCallback(
        async (image: ImageType) => {
            if (!image.imageData) {
                return;
            }
            const liked = !image.liked;
            try {
                updateImage(image.id, { liked });
                await api.likeImage(image.id, liked);
            } catch (e) {
                updateImage(image.id, { liked: !liked });
                toast(
                    "There was an error liking an image. Please try again later."
                );
            }
        },
        [updateImage]
    );
};
