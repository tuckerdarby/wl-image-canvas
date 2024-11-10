import { Request, Response } from "express";
import { IContext } from "../../context";

export const getLikeImageAPI = (context: IContext) => {
    const likeImageAPI = async (req: Request, res: Response): Promise<void> => {
        try {
            const { imageId, liked } = req.body;

            if (!imageId || typeof imageId !== "string") {
                res.status(400).json({
                    error: "imageId is required and must be a string",
                });
                return;
            }

            if (typeof liked !== "boolean") {
                res.status(400).json({
                    error: "liked is required and must be a boolean",
                });
                return;
            }

            const image = await context.operators.image.update(imageId, {
                liked,
            });
            res.json(image);
        } catch (error) {
            console.error("Unexpected error in image like:", error);
            res.status(500).json({
                error: "Unexpected error while liking image",
            });
        }
    };

    return likeImageAPI;
};
