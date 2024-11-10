import { Request, Response } from "express";
import { IContext } from "../../context";

export const getDeleteImageAPI = (context: IContext) => {
    const deleteImageAPI = async (
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

            console.log(`Deleting image with id: ${imageId}`);

            const deleted = await context.operators.image.delete(imageId);
            if (!deleted) {
                res.status(404).json({
                    error: `Image does not exist`,
                });
                return;
            }

            res.json({ success: true });
        } catch (error) {
            console.error("Unexpected error in image deletion:", error);
            res.status(500).json({
                error: "Unexpected error while deleting image",
            });
        }
    };

    return deleteImageAPI;
};
