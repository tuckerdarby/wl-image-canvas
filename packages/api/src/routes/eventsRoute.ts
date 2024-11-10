import { Router } from "express";
import { getEventsConnectionAPI } from "../controllers/events/eventsController";
import { IContext } from "../context";

export const createEventsRouter = (context: IContext) => {
    const router = Router();

    router.get("/events", getEventsConnectionAPI(context));

    return router;
};
