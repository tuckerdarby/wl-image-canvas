import { useImages, useUpdateImage } from "@/state/ImageContext";
import React, { useEffect, useRef, useState } from "react";
import { ImageBox } from "./ImageBox";

interface ICanvasContainerProps {
    children?: React.ReactNode;
}

interface IDragState {
    isDragging: boolean;
    currentId: string | null;
    startX: number;
    startY: number;
    offsetX: number;
    offsetY: number;
}

export const CanvasContainer: React.FC<ICanvasContainerProps> = () => {
    const images = useImages();
    const updateImage = useUpdateImage();
    const [activeImageId, setActiveImageId] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [dragState, setDragState] = useState<IDragState>({
        isDragging: false,
        currentId: null,
        startX: 0,
        startY: 0,
        offsetX: 0,
        offsetY: 0,
    });

    const handleMouseDown = (e: React.MouseEvent, id: string) => {
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;
        setActiveImageId(id);

        setDragState({
            isDragging: true,
            currentId: id,
            startX: e.clientX,
            startY: e.clientY,
            offsetX,
            offsetY,
        });
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
        if (
            !dragState.isDragging ||
            !dragState.currentId ||
            !containerRef.current
        )
            return;

        const scrollTop = containerRef.current.scrollTop;
        const newX = e.clientX - dragState.offsetX;
        const newY = e.clientY - dragState.offsetY + scrollTop;

        updateImage(dragState.currentId, { x: newX, y: newY });
    };

    const handleMouseUp = () => {
        setDragState({
            isDragging: false,
            currentId: null,
            startX: 0,
            startY: 0,
            offsetX: 0,
            offsetY: 0,
        });
    };

    useEffect(() => {
        if (dragState.isDragging) {
            window.addEventListener("mousemove", handleGlobalMouseMove);
            window.addEventListener("mouseup", handleMouseUp);

            return () => {
                window.removeEventListener("mousemove", handleGlobalMouseMove);
                window.removeEventListener("mouseup", handleMouseUp);
            };
        }
    }, [
        dragState.isDragging,
        dragState.currentId,
        dragState.offsetX,
        dragState.offsetY,
    ]);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 overflow-y-auto bg-gray-100"
            onMouseUp={handleMouseUp}
        >
            {images.map((image) => (
                <ImageBox
                    key={image.id}
                    image={image}
                    handleMouseDown={handleMouseDown}
                    isActive={image.id === activeImageId}
                    isDragging={image.id === dragState.currentId}
                />
            ))}
        </div>
    );
};
