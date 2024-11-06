import { useGetImage } from "@/state/ImageContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useCallback, useEffect, useState } from "react";
import { useCreateImage } from "@/hooks/useCreateImage";
import { useSelectedImageId } from "@/state/SelectedContext";
import { useUpdateImagePrompt } from "@/hooks/useUpdateImagePrompt";

export const GenerateBox = () => {
    const createImage = useCreateImage();
    const [prompt, setPrompt] = useState("");
    const selectedImageId = useSelectedImageId();
    const getImage = useGetImage();
    const selectedImage = getImage(selectedImageId);
    const updateImagePrompt = useUpdateImagePrompt();

    useEffect(() => {
        if (selectedImage === null) {
            setPrompt("");
        } else {
            setPrompt(selectedImage.prompt);
        }
    }, [selectedImageId]);

    const handleAddImage = useCallback(() => {
        if (!prompt) {
            return;
        }
        createImage(prompt);
        setPrompt("");
    }, [prompt, createImage, prompt]);

    const handleInput = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const inputText = event.target.value;
            // Filter out the special characters
            if (["+", "-", "!"].includes(inputText.slice(-1))) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();
            setPrompt(inputText);
            // TODO change this so that it works for non loading too
            if (selectedImage && !selectedImage.loading) {
                updateImagePrompt(selectedImage, inputText);
            }
        },
        [setPrompt, selectedImage]
    );

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                if (selectedImage) {
                    return;
                }
                handleAddImage();
            }}
            className="flex gap-4"
        >
            <Input
                value={prompt}
                onChange={handleInput}
                type="text"
                placeholder="Type here to generate..."
            />
            <Button type="submit">Create New</Button>
        </form>
    );
};
