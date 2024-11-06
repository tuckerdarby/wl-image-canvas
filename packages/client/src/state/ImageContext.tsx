import { IImageProperties, ImageType } from "@/types/imageTypes";
import { IImageModel } from "@wl-image-canvas/types";
import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from "react";

interface IImageContext {
    images: ImageType[];
    updateImage: (id: string, properties: Partial<IImageProperties>) => void;
    loadImage: (
        id: string,
        imageData: IImageModel,
        imageCounter: number
    ) => void;
    removeImage: (id: string) => void;
    addImage: (image: ImageType) => void;
    setImages: (images: ImageType[]) => void;
}

const ImageContext = createContext<IImageContext>({
    images: [],
    updateImage: () => {},
    loadImage: () => {},
    removeImage: () => {},
    addImage: () => {},
    setImages: () => {},
});

interface IImageProviderProps {
    children: React.ReactNode;
}

export const ImageProvider: React.FC<IImageProviderProps> = ({ children }) => {
    const [images, setImages] = useState<ImageType[]>([]);

    const updateImage = useCallback(
        (refId: string, properties: Partial<IImageProperties>) => {
            setImages((currentImages) =>
                currentImages.map((item) =>
                    item.refId === refId ? { ...item, ...properties } : item
                )
            );
        },
        []
    );

    const loadImage = useCallback(
        (refId: string, imageData: IImageModel, imageCounter: number) => {
            setImages((currentImages) =>
                currentImages.map((item) =>
                    item.refId === refId && item.imageCounter == imageCounter
                        ? { ...item, loading: false, imageData }
                        : item
                )
            );
        },
        []
    );

    const removeImage = useCallback((refId: string) => {
        setImages((currentImages) =>
            currentImages.filter((item) => item.refId !== refId)
        );
    }, []);

    const addImage = useCallback((image: ImageType) => {
        setImages((prevItems) => [...prevItems, { ...image }]);
    }, []);

    const contextState = useMemo<IImageContext>(
        () => ({
            images,
            updateImage,
            loadImage,
            removeImage,
            addImage,
            setImages,
        }),
        [images, updateImage, removeImage, addImage, setImages]
    );
    return (
        <ImageContext.Provider value={contextState}>
            {children}
        </ImageContext.Provider>
    );
};

export const useImages = () => {
    const { images } = useContext(ImageContext);
    return images;
};

export const useAddImage = () => {
    const { addImage } = useContext(ImageContext);
    return addImage;
};

export const useRemoveImage = () => {
    const { removeImage } = useContext(ImageContext);
    return removeImage;
};

export const useUpdateImage = () => {
    const { updateImage } = useContext(ImageContext);
    return updateImage;
};

export const useLoadImage = () => {
    const { loadImage } = useContext(ImageContext);
    return loadImage;
};

export const useSetImages = () => {
    const { setImages } = useContext(ImageContext);
    return setImages;
};

export const useGetImage = () => {
    const { images } = useContext(ImageContext);

    return (imageId: string | null): ImageType | null => {
        if (!imageId) {
            return null;
        }
        const image = images.find((current) => current.refId === imageId);
        if (!image) {
            return null;
        }
        return image;
    };
};
