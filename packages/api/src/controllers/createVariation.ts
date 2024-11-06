import { Request, Response } from "express";
import { OpenAIService } from "../services/openaiService";
import { FalService } from "../services/falService";
import { DatabaseFactory } from "../operators/operator";
import {
    generateSingleImage,
    generateSinglePromptVariation,
} from "./imageUtils";

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
        console.log("getting image result");
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
