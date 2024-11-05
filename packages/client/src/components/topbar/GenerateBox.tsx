import { useAddImage } from "@/state/ImageContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useCallback, useState } from "react";

export const GenerateBox = () => {
    const addImage = useAddImage();
    const [prompt, setPrompt] = useState("");

    const handleAddImage = useCallback(() => {
        if (!prompt) {
            return;
        }
        addImage({
            id: `${Math.random()}`,
            x: 100,
            y: 100,
            width: 150,
            height: 150,
            liked: false,
            prompt,
        });
        setPrompt("");
    }, [prompt, addImage, prompt]);

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                handleAddImage();
            }}
            className="flex gap-4"
        >
            <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                type="text"
                placeholder="Type here to generate..."
            />
            <Button type="submit">Generate</Button>
        </form>
    );
};
