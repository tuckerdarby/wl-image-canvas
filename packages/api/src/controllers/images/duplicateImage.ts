import { Request, Response } from "express";
import { IContext } from "../../context";

export const getDuplicateimageAPI = (context: IContext) => {
    const duplicateImageAPI = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {
            const { imageId } = req.body;

            if (!imageId || typeof imageId !== "string") {
                res.status(400).json({
                    error: "imageId is required and must be a string",
                });
                return;
            }

            const image = await context.operators.image.get(imageId);

            if (!image.imageUrl || !image.prompt) {
                res.status(400).json({
                    error: "Images that are not loaded with an image and prompt may not be duplicated.",
                });
                return;
            }

            const duplicate = await context.operators.image.create({
                userId: image.userId,
                imageUrl: image.imageUrl,
                prompt: image.prompt,
                liked: false,
            });

            res.json(duplicate);
        } catch (error) {
            console.error("Unexpected error in image duplication:", error);
            res.status(500).json({
                error: "Unexpected error while processing image duplication",
            });
        }
    };
    return duplicateImageAPI;
};
