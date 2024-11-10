import { Request, Response } from "express";
import { DUMMY_USER_ID } from "../../constants";
import { IContext } from "../../context";

export const getEventsConnectionAPI = (context: IContext) => {
    const eventsConnectionAPI = async (req: Request, res: Response) => {
        const userId = DUMMY_USER_ID;

        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders();

        const sendEvent = (data: any) => {
            res.write(`data: ${JSON.stringify(data)}\n\n`);
        };

        context.channels.createChannel(userId);
        context.channels.addHandler(userId, sendEvent);
        sendEvent({ timestamp: Date.now() });

        res.on("close", () => {
            console.log(`Closing event stream`);
            context.channels.removeHandler(userId, sendEvent);
            res.end();
        });
    };

    return eventsConnectionAPI;
};
