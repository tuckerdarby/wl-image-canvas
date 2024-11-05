import { fal } from "@fal-ai/client";
import { SecretsService } from "./secretsService";

export class FalService {
    private static instance: FalService;

    constructor() {
        const secrets = SecretsService.getInstance();
        fal.config({
            credentials: secrets.getFalAPIKey(),
        });
    }

    static getInstance(): FalService {
        if (!FalService.instance) {
            FalService.instance = new FalService();
        }
        return FalService.instance;
    }

    async createImage(prompt: string): Promise<string> {
        const result = await fal.subscribe("fal-ai/flux/schnell", {
            input: {
                prompt,
            },
        });

        return result.data;
    }
}