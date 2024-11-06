import { Request, Response } from "express";
import { FalService } from "../services/falService";
import { DatabaseFactory } from "../operators/operator";
import { generateSingleImage } from "./imageUtils";

export const updateImageAPI = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { prompt, imageId } = req.body;

        if (!prompt || typeof prompt !== "string") {
            res.status(400).json({
                error: "Prompt is required and must be a string",
            });
            return;
        }

        if (!imageId || typeof imageId !== "string") {
            res.status(400).json({
                error: "imageId is required and must be a string",
            });
            return;
        }

        // TODO: specific error handling
        const dbOperator = DatabaseFactory.getOperator();
        const currentImage = await dbOperator.get(imageId);

        // Get Image
        const falService = FalService.getInstance();
        const imageResult = await generateSingleImage(falService, prompt);

        if (!imageResult.success) {
            console.error(
                "Received failing responses from Fal: ",
                imageResult.error
            );
            res.status(500).json({
                error: "Unexpected error while creating image",
            });
            return;
        }

        const updatedImage = await dbOperator.update(
            currentImage.id,
            prompt,
            imageResult.imageUrl
        );

        res.json(updatedImage);
    } catch (error) {
        console.error("Unexpected error in image update:", error);
        res.status(500).json({
            error: "Unexpected error while processing image update",
        });
    }
};
