import { Router } from "express";
import { createImageAPI } from "../controllers/createImage";
import { updateImageAPI } from "../controllers/updateImage";
import { createImageVariationAPI } from "../controllers/createVariation";
import { deleteImageAPI } from "../controllers/deleteImage";
import { duplicateImageAPI } from "../controllers/duplicateImage";

const createRouter = () => {
    const router = Router();

    router.post("/create", createImageAPI);
    router.post("/duplicate", duplicateImageAPI);
    router.post("/variation", createImageVariationAPI);

    router.put("/update", updateImageAPI);

    router.delete("/delete", deleteImageAPI);

    return router;
};

export const imageRouter = createRouter();
