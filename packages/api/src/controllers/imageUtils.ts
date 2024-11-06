import { OpenAIService } from "../services/openaiService";
import { FalService } from "../services/falService";

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

export async function generateSinglePromptVariation(
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

async function testImage() {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return "https://alamocitygolftrail.com/wp-content/uploads/2022/11/canstockphoto22402523-arcos-creator.com_-1024x1024-1.jpg";
}

export async function generateSingleImage(
    falService: FalService,
    prompt: string
): Promise<ImageResult | ErrorResult> {
    try {
        const imageData = await falService.createImage(prompt); // TODO turn this on when done testing
        // const testImageUrl = await testImage();
        return {
            success: true,
            prompt,
            imageUrl: imageData.images[0].url,
        };
    } catch (error) {
        console.error(`Failed to generate image for variation:`, error);
        return {
            success: false,
            error: "Failed to generate image for this variation",
        };
    }
}
