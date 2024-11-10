import { Request, Response } from "express";
import { generateSingleImage } from "../imageUtils";
import { IContext } from "src/context";
import { createUpdateImageEvent } from "../../events/createEvent";
import { IImageModel } from "@wl-image-canvas/types";

const createUpdateImageTask = async (
    context: IContext,
    image: IImageModel,
    prompt: string
) => {
    try {
        const imageResult = await generateSingleImage(context, prompt);
        if (!imageResult.success) {
            // TODO error event
            console.error(
                `Error on createImageTask when creating image for ${prompt} and image ${image.id}:`,
                imageResult
            );
            return;
        }
        const newImage: IImageModel = {
            ...image,
            prompt,
            imageUrl: imageResult.imageUrl,
        };
        const updated = await context.operators.image.set(newImage);
        if (updated) {
            context.channels.sendToChannel(
                image.userId,
                createUpdateImageEvent(newImage)
            );
        }
    } catch (e) {
        // TODO error event
        console.error(`Error on UpdateImageTask:`, e);
    }
};

export const getUpdateImageAPI = (context: IContext) => {
    const updateImageAPI = async (
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

            const image = await context.operators.image.update(imageId, {
                prompt,
            });

            createUpdateImageTask(context, image, prompt);

            res.json({ success: true });
        } catch (error) {
            console.error("Unexpected error in image update:", error);
            res.status(500).json({
                error: "Unexpected error while processing image update",
            });
        }
    };

    return updateImageAPI;
};
