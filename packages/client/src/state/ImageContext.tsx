import { IImage, IImageProperties } from "@/types/imageTypes";
import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from "react";

interface IImageContext {
    images: IImage[];
    updateImage: (id: string, properties: Partial<IImageProperties>) => void;
    deleteImage: (id: string) => void;
    addImage: (image: IImage) => void;
    setImages: (images: IImage[]) => void;
}

const ImageContext = createContext<IImageContext>({
    images: [],
    updateImage: () => {},
    deleteImage: () => {},
    addImage: () => {},
    setImages: () => {},
});

interface IImageProviderProps {
    children: React.ReactNode;
}

export const ImageProvider: React.FC<IImageProviderProps> = ({ children }) => {
    const [images, setImages] = useState<IImage[]>([]);

    const updateImage = useCallback(
        (id: string, properties: Partial<IImageProperties>) => {
            setImages((currentImages) =>
                currentImages.map((item) =>
                    item.id === id ? { ...item, ...properties } : item
                )
            );
        },
        []
    );

    const deleteImage = useCallback((id: string) => {
        setImages((currentImages) =>
            currentImages.filter((item) => item.id !== id)
        );
    }, []);

    const addImage = useCallback((image: IImage) => {
        setImages((prevItems) => [...prevItems, { ...image }]);
    }, []);

    const contextState = useMemo<IImageContext>(
        () => ({
            images,
            updateImage,
            deleteImage,
            addImage,
            setImages,
        }),
        [images, updateImage, deleteImage, addImage, setImages]
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

export const useDeleteImage = () => {
    const { deleteImage } = useContext(ImageContext);
    return deleteImage;
};

export const useUpdateImage = () => {
    const { updateImage } = useContext(ImageContext);
    return updateImage;
};

export const useSetImages = () => {
    const { setImages } = useContext(ImageContext);
    return setImages;
};
