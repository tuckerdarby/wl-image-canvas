import { FalService } from "./services/falService";
import { SecretsService } from "./services/secretsService";
import { OpenAIService } from "./services/openaiService";
import { IDatabaseOperator } from "./operators/types";
import { ChannelManager } from "./events/channelManager";
import { getOperator } from "./operators/operator";

export interface IContext {
    services: {
        secrets: SecretsService;
        fal: FalService;
        openai: OpenAIService;
    };
    operators: {
        image: IDatabaseOperator;
    };
    channels: ChannelManager;
}

export const createContext = async (): Promise<IContext> => {
    const secrets = new SecretsService();
    await secrets.initialize();
    const imageDBOperator = getOperator();
    const fal = new FalService(secrets);
    const openai = new OpenAIService(secrets);
    const channels = new ChannelManager();

    return {
        services: {
            secrets,
            fal,
            openai,
        },
        operators: {
            image: imageDBOperator,
        },
        channels,
    };
};
