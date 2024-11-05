import OpenAI from "openai";
import { SecretsService } from "./secretsService";

export class OpenAIService {
    private client: OpenAI;
    private static instance: OpenAIService;

    constructor() {
        const secrets = SecretsService.getInstance();
        this.client = new OpenAI({
            apiKey: secrets.getOpenAIAPIKey(),
        });
    }

    static getInstance(): OpenAIService {
        if (!OpenAIService.instance) {
            OpenAIService.instance = new OpenAIService();
        }
        return OpenAIService.instance;
    }

    async createVariation(prompt: string): Promise<string> {
        const response = await this.client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content:
                        "Create a variation of the given prompt while maintaining its core meaning.",
                },
                {
                    role: "user",
                    content: `Original: ${prompt}\nCreate a variation. Only reply with the variation.`,
                },
            ],
            temperature: 0.7,
        });

        return response.choices[0]?.message?.content ?? "";
    }
}
