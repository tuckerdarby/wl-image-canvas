import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import { SecretsService } from "./services/secretsService";
import { imageRouter } from "./routes/imageRoute";

export async function startApp() {
    await SecretsService.getInstance().initialize();

    const app: Express = express();
    const port = process.env.PORT || 3000;

    const isDevelopment = process.env.NODE_ENV === "development";

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

    app.use("/api/image", imageRouter);

    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });

    return app;
}

startApp();
