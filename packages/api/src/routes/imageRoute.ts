// src/routes/imageVariations.ts
import { Router } from "express";
import {
    createImageVariationAPI,
    createImageAPI,
} from "../controllers/imageController";

const createRouter = () => {
    const router = Router();

    router.post("/variation", createImageVariationAPI);
    router.post("/create", createImageAPI);

    return router;
};

export const imageRouter = createRouter();
