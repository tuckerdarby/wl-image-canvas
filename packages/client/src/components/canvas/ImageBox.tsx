import { useCreateImageVariations } from "@/hooks/useCreateImageVariations";
import { useDeleteImage } from "@/hooks/useDeleteImage";
import { useDuplicateImage } from "@/hooks/useDuplicateImage";
import { ImageType } from "@/types/imageTypes";
import { useEffect } from "react";
import { toast } from "sonner";
import { Heart } from "lucide-react";
import { useLikeImage } from "@/hooks/useLikeImage";

interface IImageBoxProps {
    image: ImageType;
    handleMouseDown: (e: React.MouseEvent, refId: string) => void;
    isActive: boolean;
    isDragging: boolean;
}

export const ImageBox: React.FC<IImageBoxProps> = ({
    image,
    handleMouseDown,
    isActive,
    isDragging,
}) => {
    const likeImage = useLikeImage();
    const deleteImage = useDeleteImage();
    const duplicateImage = useDuplicateImage();
    const createVariation = useCreateImageVariations();

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (!isActive) return;

            switch (e.key) {
                case "+":
                    if (image?.imageData) {
                        duplicateImage(image);
                    } else {
                        toast(
                            "Please wait till the initial image is done loading."
                        );
                    }
                    break;
                case "-":
                    deleteImage(image);
                    break;
                case "!":
                    createVariation(image);
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, [isActive, image]);

    return (
        <div
            className={`absolute ${
                !isDragging ? "transition-all duration-500 ease-in-out" : ""
            }`}
            style={{
                zIndex: isActive ? 1 : 0,
                left: image.x,
                top: image.y,
                width: image.width,
            }}
            onMouseDown={(e) => handleMouseDown(e, image.id)}
        >
            <div className="relative">
                <div
                    className={`cursor-move shadow-lg hover:shadow-xl transition-shadow ${
                        !image?.imageData
                            ? "bg-slate-700"
                            : "border-2 border-white"
                    }`}
                    style={{
                        height: image.height,
                        ...(!image?.imageData
                            ? {}
                            : {
                                  backgroundImage: `url(${image.imageData.imageUrl})`,
                                  backgroundSize: "cover",
                                  backgroundPosition: "center",
                              }),
                    }}
                />
                {image?.imageData && isActive && (
                    <button
                        className="absolute top-2 right-2 p-1 rounded-full bg-white bg-opacity-75 hover:bg-opacity-100 transition-all"
                        onClick={(e) => {
                            e.stopPropagation();
                            likeImage(image);
                        }}
                    >
                        <Heart
                            size={20}
                            className={`${
                                image.liked
                                    ? "fill-red-500 stroke-red-500"
                                    : "stroke-gray-600"
                            }`}
                        />
                    </button>
                )}
            </div>
            {isActive && image.currentPrompt && (
                <div
                    className="bg-slate-700 bg-opacity-90 mt-2 text-white break-words whitespace-normal"
                    style={{ width: image.width }}
                >
                    {image.currentPrompt}
                </div>
            )}
        </div>
    );
};
