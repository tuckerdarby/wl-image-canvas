import {
    MARGIN_WIDTH,
    GRID_GAP,
    MARGIN_HEIGHT,
    IMAGE_WIDTH,
    IMAGE_HEIGHT,
    INIT_IMAGE_X,
} from "@/constants";
import { useUpdateImage } from "@/state/ImageContext";
import { ImageType } from "@/types/imageTypes";
import { useCallback } from "react";

export const useSortImages = () => {
    const updateImage = useUpdateImage();

    return useCallback(
        (images: ImageType[]) => {
            if (images.length === 0) return;

            const availableWidth = (window.innerWidth - MARGIN_WIDTH * 2) / 2;

            const columnsCount = Math.max(
                1,
                Math.floor(availableWidth / (IMAGE_WIDTH + GRID_GAP))
            );

            images.forEach((image, index) => {
                const row = Math.floor(index / columnsCount);
                const col = index % columnsCount;

                const targetX = INIT_IMAGE_X + col * (IMAGE_WIDTH + GRID_GAP);
                const targetY =
                    MARGIN_HEIGHT + (row + 1) * (IMAGE_HEIGHT + GRID_GAP);

                updateImage(image.id, { x: targetX, y: targetY });
            });
        },
        [updateImage]
    );
};
