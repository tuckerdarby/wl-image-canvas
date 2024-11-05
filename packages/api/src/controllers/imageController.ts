import { Request, RequestHandler, Response } from "express";
import { OpenAIService } from "../services/openaiService";
import { FalService } from "../services/falService";
import { DatabaseFactory } from "../operators/operator";
import { IImageModel } from "@wl-image-canvas/types";

interface PromptResult {
    success: true;
    prompt?: string;
}

interface ImageResult {
    success: true;
    prompt: string;
    imageUrl: string;
}

interface ErrorResult {
    success: false;
    error: string;
}

async function generateSinglePromptVariation(
    openAIService: OpenAIService,
    prompt: string
): Promise<PromptResult | ErrorResult> {
    try {
        const variation = await openAIService.createVariation(prompt);
        return {
            success: true,
            prompt: variation,
        };
    } catch (error) {
        console.error(`Failed to generate variation`, error);
        return {
            success: false,
            error: "Failed to generate this variation",
        };
    }
}

async function generateSingleImage(
    falService: FalService,
    prompt: string
): Promise<ImageResult | ErrorResult> {
    try {
        const imageUrl = await falService.createImage(prompt);
        return {
            success: true,
            prompt,
            imageUrl,
        };
    } catch (error) {
        console.error(`Failed to generate image for variation:`, error);
        return {
            success: false,
            error: "Failed to generate image for this variation",
        };
    }
}

export const createImageVariationAPI = async (
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

        // Get Prompt Variations
        const openAIService = OpenAIService.getInstance();
        const promptResult = await generateSinglePromptVariation(
            openAIService,
            prompt
        );

        if (!promptResult.success) {
            console.error(
                "Received failing response from OpenAI:",
                promptResult.error
            );
            res.status(500).json({
                error: "Unexpected error while processing variations",
            });
            return;
        }

        // Get Images for Prompts
        const falService = FalService.getInstance();
        const imageResult = await generateSingleImage(
            falService,
            promptResult.prompt!
        );

        // Combine successful and failed results
        if (!imageResult.success) {
            console.error(
                "Received failing responses from Fal: ",
                imageResult.error
            );
            res.status(500).json({
                error: "Unexpected error while processing variations",
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
        console.error("Unexpected error in variation generation:", error);
        res.status(500).json({
            error: "Unexpected error while processing variations",
        });
    }
};

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
        const image = dbOperator.create({
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
