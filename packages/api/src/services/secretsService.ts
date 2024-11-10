import { SecretsManager } from "@aws-sdk/client-secrets-manager";
import dotenv from "dotenv";

export interface AppSecrets {
    OPENAI_API_KEY: string;
    FAL_API_KEY: string;
}

export class SecretsService {
    private secrets: AppSecrets | null = null;

    constructor() {}

    private getSecret(key: keyof AppSecrets): string {
        if (!this.secrets) {
            throw new Error("Secrets not initialized");
        }
        return this.secrets[key];
    }

    async initialize(): Promise<void> {
        if (process.env.NODE_ENV === "development") {
            dotenv.config();
            this.secrets = {
                OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
                FAL_API_KEY: process.env.FAL_API_KEY!,
            };
        } else {
            const secretsManager = new SecretsManager({
                region: process.env.AWS_REGION || "us-west-2",
            });

            const secretName =
                process.env.AWS_SECRET_NAME || "prod/app/secrets";
            const response = await secretsManager.getSecretValue({
                SecretId: secretName,
            });

            if (response.SecretString) {
                this.secrets = JSON.parse(response.SecretString) as AppSecrets;
            } else {
                throw new Error("No secrets found");
            }
        }
    }

    getOpenAIAPIKey(): string {
        return this.getSecret("OPENAI_API_KEY");
    }

    getFalAPIKey(): string {
        return this.getSecret("FAL_API_KEY");
    }
}
