import { Request, Response } from "express";
import { DatabaseFactory } from "../operators/operator";

export const deleteImageAPI = async (
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
        await dbOperator.delete(imageId);

        res.json(true);
    } catch (error) {
        console.error("Unexpected error in image creation:", error);
        res.status(500).json({
            error: "Unexpected error while processing image creation",
        });
    }
};
