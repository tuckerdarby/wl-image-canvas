import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import { SecretsService } from "./services/secretsService";
import { createImageRouter } from "./routes/imageRoute";
import { getOperator } from "./operators/operator";
import { FalService } from "./services/falService";
import { OpenAIService } from "./services/openaiService";
import { ChannelManager } from "./events/channelManager";
import { createEventsRouter } from "./routes/eventsRoute";
import { createContext } from "./context";

export async function startApp() {
    const app: Express = express();
    const port = process.env.PORT || 3000;

    const isDevelopment = process.env.NODE_ENV === "development";

    const context = await createContext();

    if (isDevelopment) {
        app.use(
            cors({
                origin: "http://localhost:5173",
                credentials: true,
            })
        );
    }

    app.use(express.json());

    app.get("/", (req: Request, res: Response) => {
        res.send("Hello World!");
    });

    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
        console.error(err.stack);
        res.status(500).send("Something broke!");
    });

    // Instantiate routes
    app.use("/api", createEventsRouter(context));
    app.use("/api/image", createImageRouter(context));

    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });

    return app;
}

startApp();
