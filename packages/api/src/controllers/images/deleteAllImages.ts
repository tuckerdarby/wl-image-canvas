import { Request, Response } from "express";
import { IContext } from "../../context";
import { DUMMY_USER_ID } from "../../constants";

export const getDeleteAllImagesAPI = (context: IContext) => {
    const deleteAllImagesAPI = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {
            console.log(`Deleting all images`);

            const deleted = await context.operators.image.deleteAll(
                DUMMY_USER_ID
            );

            res.json({ success: deleted });
        } catch (error) {
            console.error("Unexpected error in image deletion:", error);
            res.status(500).json({
                error: "Unexpected error while deleting image",
            });
        }
    };

    return deleteAllImagesAPI;
};
