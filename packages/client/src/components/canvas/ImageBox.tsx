import { useDeleteImage } from "@/hooks/useDeleteImage";
import { useDuplicateImage } from "@/hooks/useDuplicateImage";
import { useEffect } from "react";

export const ImageBox: React.FC<IImageBoxProps> = ({
    image,
    handleMouseDown,
    isActive,
    isDragging,
}) => {
    const deleteImage = useDeleteImage();
    const duplicateImage = useDuplicateImage();

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (!isActive) return;

            // TODO: decide best user experience
            // const activeElement = document.activeElement;
            // if (activeElement?.matches("input, textarea")) return;

            switch (e.key) {
                case "+":
                    if (!image.loading) {
                        duplicateImage(image);
                    }
                    break;
                case "-":
                    deleteImage(image);
                    break;
                case "!":
                    console.log("Exclamation key pressed");
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
            onMouseDown={(e) => handleMouseDown(e, image.refId)}
        >
            <div
                className={`cursor-move shadow-lg hover:shadow-xl transition-shadow ${
                    image.loading ? "bg-slate-700" : "border-2 border-white"
                }`}
                style={{
                    height: image.height,
                    ...(image.loading
                        ? {}
                        : {
                              backgroundImage: `url(${image.imageData.imageUrl})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                          }),
                }}
            ></div>
            {isActive && (
                <div
                    className="bg-slate-700 bg-opacity-90 mt-2 text-white break-words whitespace-normal"
                    style={{ width: image.width }}
                >
                    {image.prompt}
                </div>
            )}
        </div>
    );
};
