import {
    EventMessage,
    EventMessageType,
    IImageModel,
    ImageErrorType,
} from "@wl-image-canvas/types";

export const createUpdateImageEvent = (image: IImageModel): EventMessage => {
    return {
        type: EventMessageType.UPDATE_IMAGE,
        data: image,
    };
};

const imageErrorMessages: Record<ImageErrorType, string> = {
    [ImageErrorType.IMAGE]:
        "There was an unexpected issue generating an image.",
    [ImageErrorType.PROMPT]:
        "There was an unexpected issue generating a prompt variation.",
};

export const createImageErrorEvent = (
    id: string,
    errorType: ImageErrorType
): EventMessage => {
    return {
        type: EventMessageType.IMAGE_ERROR,
        data: {
            id,
            message: imageErrorMessages[errorType],
            type: errorType,
        },
    };
};
