import { Request, Response } from "express";
import { IContext } from "../../context";
import { DUMMY_USER_ID } from "src/constants";

export const getListImagesAPI = (context: IContext) => {
    const listImagesAPI = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {
            // Ideally we'd use middleware to attach the userId to the request
            // For the sake of time I've omitted this and auth
            // const userId = DUMMY_USER_ID; // this would be used to list a user's images
            const images = await context.operators.image.list();

            res.json({ images });
        } catch (error) {
            console.error("Unexpected error in image listing:", error);
            res.status(500).json({
                error: "Unexpected error while listing images",
            });
        }
    };

    return listImagesAPI;
};
