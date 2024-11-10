import { api } from "@/api/apiClient";
import { IImage } from "@/types/imageTypes";
import { toast } from "sonner";

export const useUpdateImagePrompt = () => {
    return async (image: IImage, prompt: string) => {
        try {
            await api.updateImage(image.id, prompt);
        } catch (e) {
            toast(
                `There was an issue updating the image prompt. Please try again.`
            );
        }
    };
};
