import {
    EventMessageType,
    IImageModel,
    IEventMessage,
} from "@wl-image-canvas/types";

export const createUpdateImageEvent = (image: IImageModel): IEventMessage => {
    return {
        type: EventMessageType.UPDATE_IMAGE,
        data: image,
    };
};
