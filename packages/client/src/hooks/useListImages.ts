import { api } from "@/api/apiClient";
import { useImages, useSetImages } from "@/state/ImageContext";
import { ImageType } from "@/types/imageTypes";
import { useCallback } from "react";
import { toast } from "sonner";
import { useSortImages } from "./useSortImages";
import {
    IMAGE_HEIGHT,
    IMAGE_WIDTH,
    INIT_IMAGE_X,
    INIT_IMAGE_Y,
} from "@/constants";
import { IImageModel } from "@wl-image-canvas/types";

const initImage = (image: IImageModel): ImageType => {
    return {
        id: image.id,
        x: INIT_IMAGE_X,
        y: INIT_IMAGE_Y,
        width: IMAGE_WIDTH,
        height: IMAGE_HEIGHT,
        currentPrompt: image.prompt,
        liked: image.liked,
        imageData: image,
    };
};

export const useListImages = () => {
    const images = useImages();
    const setImages = useSetImages();
    const sortImages = useSortImages();

    return useCallback(async () => {
        try {
            const imagesData = await api.listImages();
            const newImages = imagesData.images.map(initImage);
            setImages([...images, ...newImages]);
            sortImages(newImages);
        } catch (e) {
            toast("There was an error getting images. Please try again later.");
        }
    }, [images, setImages, sortImages]);
};
