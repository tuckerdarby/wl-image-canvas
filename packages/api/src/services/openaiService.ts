import OpenAI from "openai";
import { SecretsService } from "./secretsService";

export class OpenAIService {
    private client: OpenAI;

    constructor(secretsService: SecretsService) {
        this.client = new OpenAI({
            apiKey: secretsService.getOpenAIAPIKey(),
        });
    }

    async createVariation(prompt: string): Promise<string> {
        const temperatures = [0.7, 0.8, 0.9, 1.0];
        const randomTemp =
            temperatures[Math.floor(Math.random() * temperatures.length)];

        const presencePenalty = Math.random() * 0.6;
        const frequencyPenalty = Math.random() * 0.6;

        const instructions = [
            "Create a unique variation of the given prompt while maintaining pieces of it.",
            "Rephrase the following prompt in a different way while keeping the same intent.",
            "Change an object in this prompt to something similar.",
            "Generate an alternative version of this prompt with similar meaning.",
            "Rewrite this prompt using different subjects but preserve the main message. Be creative.",
            "Add something to this prompt.",
        ];
        const randomInstruction =
            instructions[Math.floor(Math.random() * instructions.length)];

        const response = await this.client.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: [
                {
                    role: "system",
                    content: randomInstruction,
                },
                {
                    role: "user",
                    content: `Original: ${prompt}\nCreate a variation. Only reply with the variation.`,
                },
            ],
            temperature: randomTemp,
            presence_penalty: presencePenalty,
            frequency_penalty: frequencyPenalty,
            top_p: 0.9,
        });

        return response.choices[0]?.message?.content ?? "";
    }

    // Optional: Create multiple variations at once
    async createMultipleVariations(
        prompt: string,
        count: number = 3
    ): Promise<string[]> {
        const variations: string[] = [];
        for (let i = 0; i < count; i++) {
            const variation = await this.createVariation(prompt);
            variations.push(variation);
        }
        return variations;
    }
}
