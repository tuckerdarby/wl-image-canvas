import { Request, Response } from "express";
import { FalService } from "../services/falService";
import { DatabaseFactory } from "../operators/operator";
import { generateSingleImage } from "./imageUtils";

export const createImageAPI = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { prompt } = req.body;

        if (!prompt || typeof prompt !== "string") {
            res.status(400).json({
                error: "Prompt is required and must be a string",
            });
            return;
        }

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

        const dbOperator = DatabaseFactory.getOperator();
        const image = await dbOperator.create({
            imageUrl: imageResult.imageUrl,
            prompt: imageResult.prompt,
            liked: false,
        });

        res.json(image);
    } catch (error) {
        console.error("Unexpected error in image creation:", error);
        res.status(500).json({
            error: "Unexpected error while processing image creation",
        });
    }
};
