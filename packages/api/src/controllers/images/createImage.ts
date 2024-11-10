import { Request, Response } from "express";
import { IImageModel } from "@wl-image-canvas/types";
import { generateSingleImage } from "../imageUtils";
import { DUMMY_USER_ID } from "../../constants";
import { createUpdateImageEvent } from "../../events/createEvent";
import { IContext } from "../../context";

const createImageTask = async (
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
            imageUrl: imageResult.imageUrl,
        };
        const updated = await context.operators.image.set(newImage);
        if (updated) {
            console.log(
                `Sending event to user ${image.userId} with imageId ${image.id}`
            );
            context.channels.sendToChannel(
                image.userId,
                createUpdateImageEvent(newImage)
            );
        }
    } catch (e) {
        // TODO error event
        console.error(`Error on CreateImageTask:`, e);
    }
};

export const getCreateImageAPI = (context: IContext) => {
    const createImageAPI = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {
            // Ideally we'd use middleware to attach the userId to the request
            // For the sake of time I've omitted this and auth
            const userId = DUMMY_USER_ID;
            const { prompt } = req.body;

            if (!prompt || typeof prompt !== "string") {
                res.status(400).json({
                    error: "Prompt is required and must be a string",
                });
                return;
            }

            console.log(
                `Creating new image for user ${userId} with prompt ${prompt}`
            );

            const image = await context.operators.image.create({
                userId, // TODO move to context
                prompt,
                liked: false,
            });

            createImageTask(context, image, prompt);

            res.json(image);
        } catch (error) {
            console.error("Unexpected error in image creation:", error);
            res.status(500).json({
                error: "Unexpected error while processing image creation",
            });
        }
    };

    return createImageAPI;
};
