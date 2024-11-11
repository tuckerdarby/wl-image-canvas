import { fal } from "@fal-ai/client";
import { SecretsService } from "./secretsService";

interface IImageResult {
    images: {
        url: string;
    }[];
}

export class FalService {
    constructor(secretsService: SecretsService) {
        fal.config({
            credentials: secretsService.getFalAPIKey(),
        });
    }

    async createImage(prompt: string): Promise<IImageResult> {
        const result = await fal.subscribe("fal-ai/fast-turbo-diffusion", {
            input: {
                prompt,
                image_size: {
                    width: 512,
                    height: 512,
                },
            },
        });

        return result.data;
    }
}
