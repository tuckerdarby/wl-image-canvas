import { Request, Response } from "express";
import { DatabaseFactory } from "../operators/operator";

export const duplicateImageAPI = async (
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

        const dbOperator = DatabaseFactory.getOperator();
        const image = await dbOperator.get(imageId);

        const duplicate = await dbOperator.create({
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
