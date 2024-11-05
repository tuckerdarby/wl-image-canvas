import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";

const app: Express = express();
const port: number = 3000;

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

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

export default app;
