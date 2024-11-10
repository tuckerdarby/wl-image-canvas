import { useGetImage, useUpdateImage } from "@/state/ImageContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useCallback, useEffect, useState, useRef } from "react";
import { useCreateImage } from "@/hooks/useCreateImage";
import { useSelectedImageId } from "@/state/SelectedContext";
import { useUpdateImagePrompt } from "@/hooks/useUpdateImagePrompt";
import { debounce } from "lodash";
import { IImage } from "@/types/imageTypes";

export const GenerateBox = () => {
    const createImage = useCreateImage();
    const [prompt, setPrompt] = useState("");
    const selectedImageId = useSelectedImageId();
    const getImage = useGetImage();
    const selectedImage = getImage(selectedImageId);
    const updateImagePrompt = useUpdateImagePrompt();
    const updateImage = useUpdateImage();

    const debouncedUpdateImagePrompt = useRef(
        debounce((image: IImage, promptText: string) => {
            updateImagePrompt(image, promptText);
        }, 500)
    ).current;

    useEffect(() => {
        if (selectedImage === null) {
            setPrompt("");
        } else {
            setPrompt(selectedImage.currentPrompt || "");
        }
    }, [selectedImageId]);

    useEffect(() => {
        return () => {
            debouncedUpdateImagePrompt.cancel();
        };
    }, [debouncedUpdateImagePrompt]);

    const handleAddImage = useCallback(() => {
        if (!prompt) {
            return;
        }
        createImage(prompt);
        setPrompt("");
    }, [prompt, createImage]);

    const handleInput = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const inputText = event.target.value;
            if (["+", "-", "!"].includes(inputText.slice(-1))) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();
            setPrompt(inputText);

            if (selectedImage) {
                updateImage(selectedImage.id, { currentPrompt: inputText });
                debouncedUpdateImagePrompt(selectedImage, inputText);
            }
        },
        [setPrompt, selectedImage, updateImage, debouncedUpdateImagePrompt]
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
                className="w-96"
                placeholder="Type here to generate..."
            />
            <Button type="submit">Create New</Button>
        </form>
    );
};
