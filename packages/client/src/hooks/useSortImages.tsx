import { useUpdateImage } from "@/state/ImageContext";
import { IImage } from "@/types/imageTypes";
import { useCallback } from "react";

export const useSortImages = () => {
    const updateImage = useUpdateImage();

    const GRID_GAP = 20;
    const MARGIN_HEIGHT = 600;
    const MARGIN_WIDTH = 150;

    return useCallback(
        (images: IImage[]) => {
            if (images.length === 0) return;

            const availableWidth = window.innerWidth - MARGIN_WIDTH * 2;
            const maxImageWidth = Math.max(...images.map((img) => img.width));

            const columnsCount = Math.max(
                1,
                Math.floor(availableWidth / (maxImageWidth + GRID_GAP))
            );

            images.forEach((image, index) => {
                const row = Math.floor(index / columnsCount);
                const col = index % columnsCount;

                const targetX = MARGIN_WIDTH + col * (maxImageWidth + GRID_GAP);
                const targetY = MARGIN_HEIGHT + row * (image.height + GRID_GAP);

                updateImage(image.id, { x: targetX, y: targetY });
            });
        },
        [updateImage]
    );
};
