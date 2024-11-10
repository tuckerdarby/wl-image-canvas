import { Request, Response } from "express";
import {
    generateSingleImage,
    generateSinglePromptVariation,
} from "../imageUtils";
import { DUMMY_USER_ID } from "../../constants";
import { IContext } from "src/context";
import { IImageModel } from "@wl-image-canvas/types";
import { createUpdateImageEvent } from "../../events/createEvent";

const imageVariationTask = async (
    context: IContext,
    image: IImageModel,
    prompt: string
) => {
    try {
        const promptData = await generateSinglePromptVariation(context, prompt);
        if (!promptData.success || !promptData.prompt) {
            // Could be a PII issue to store prompts in logs here, but leaving it for test/debugging purposes
            console.error(
                `Error on ImageVariationTask when creating prompt variation for ${prompt} and image ${image.id}:`,
                promptData
            );
            // TODO error event
            return;
        }
        const imageData = await generateSingleImage(context, promptData.prompt);
        if (!imageData.success) {
            console.error(
                `Error on ImageVariationTask when creating image variation for ${prompt} and image ${image.id}:`,
                imageData
            );
            // TODO error event
            return;
        }

        const updatedImage: IImageModel = {
            ...image,
            prompt: promptData.prompt,
            imageUrl: imageData.imageUrl,
        };
        await context.operators.image.update(image.id, updatedImage);
        context.channels.sendToChannel(
            image.userId,
            createUpdateImageEvent(updatedImage)
        );
    } catch (e) {
        // TODO error event
        console.error(`Error on ImageVariationTask:`, e);
    }
};

export const getCreateImageVariationAPI = (context: IContext) => {
    const createImageVariationAPI = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {
            const { prompt, variationCount } = req.body;

            if (!prompt || typeof prompt !== "string") {
                res.status(400).json({
                    error: "Prompt is required and must be a string",
                });
                return;
            }

            if (
                !variationCount ||
                typeof variationCount !== "number" ||
                variationCount > 4
            ) {
                res.status(400).json({
                    error: "Number of variations must be more than 0 and less than 4",
                });
                return;
            }

            console.log(
                `Creating ${variationCount} image variations for image ${prompt}`
            );

            const imageData = [...Array(variationCount).keys()].map(() => {
                return {
                    userId: DUMMY_USER_ID,
                    liked: false,
                };
            });

            const images = await context.operators.image.createMultiple(
                imageData
            );
            // NOTE: Alternatively we could use Fal's multi image queue
            // and OpenAI's templating.
            // For the sake of time I've gone this route.
            images.forEach((image) => {
                imageVariationTask(context, image, prompt);
            });

            res.json({
                images,
            });
        } catch (error) {
            console.error("Unexpected error in variation generation:", error);
            res.status(500).json({
                error: "Unexpected error while processing variations",
            });
        }
    };
    return createImageVariationAPI;
};
