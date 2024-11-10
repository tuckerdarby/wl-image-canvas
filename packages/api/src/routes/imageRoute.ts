import { Router } from "express";
import { IContext } from "src/context";
import { getCreateImageAPI } from "../controllers/images/createImage";
import { getUpdateImageAPI } from "../controllers/images/updateImage";
import { getCreateImageVariationAPI } from "../controllers/images/createVariation";
import { getDeleteImageAPI } from "../controllers/images/deleteImage";
import { getDuplicateimageAPI } from "../controllers/images/duplicateImage";
import { getLikeImageAPI } from "../controllers/images/likeImage";
import { getListImagesAPI } from "../controllers/images/listImages";
import { getDeleteAllImagesAPI } from "../controllers/images/deleteAllImages";

export const createImageRouter = (context: IContext) => {
    const router = Router();

    router.get("/list", getListImagesAPI(context));

    router.post("/create", getCreateImageAPI(context));
    router.post("/duplicate", getDuplicateimageAPI(context));
    router.post("/variation", getCreateImageVariationAPI(context));

    router.put("/update", getUpdateImageAPI(context));
    router.put("/like", getLikeImageAPI(context));

    router.delete("/delete", getDeleteImageAPI(context));
    router.delete("/clear", getDeleteAllImagesAPI(context));

    return router;
};
