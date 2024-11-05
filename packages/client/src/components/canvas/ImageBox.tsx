import { useUpdateImage } from "@/state/ImageContext";
import { IImage } from "@/types/imageTypes";

interface IImageBoxProps {
    image: IImage;
    handleMouseDown: (e: React.MouseEvent, id: string) => void;
    isActive: boolean;
    isDragging: boolean;
}

export const ImageBox: React.FC<IImageBoxProps> = ({
    image,
    handleMouseDown,
    isActive,
    isDragging,
}) => {
    const updateImage = useUpdateImage();

    return (
        <div
            key={image.id}
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
            <div
                className="bg-slate-700 cursor-move shadow-lg hover:shadow-xl transition-shadow"
                style={{
                    height: image.height,
                }}
            >
                <div className="p-2 text-white select-none">
                    Image {image.id}
                </div>
            </div>
            {isActive && (
                <div className="bg-slate-700 bg-opacity-90 mt-2 text-white">
                    {image.prompt}
                </div>
            )}
        </div>
    );
};
