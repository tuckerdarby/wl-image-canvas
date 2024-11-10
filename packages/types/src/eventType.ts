import { IImageModel } from "./imageType";

export enum EventMessageType {
    UPDATE_IMAGE = "UPDATE_IMAGE",
    IMAGE_ERROR = "IMAGE_ERROR",
}

export enum ImageErrorType {
    PROMPT = "PROMPT",
    IMAGE = "IMAGE",
}

export interface IImageError {
    id: string;
    message: string;
    type: ImageErrorType;
}

interface IEventMessage {
    type: EventMessageType;
    data: IImageModel | IImageError;
}

interface ImageEventMessage extends IEventMessage {
    type: EventMessageType.UPDATE_IMAGE;
    data: IImageModel;
}

interface ErrorEventMessage extends IEventMessage {
    type: EventMessageType.IMAGE_ERROR;
    data: IImageError;
}

export type EventMessage = ImageEventMessage | ErrorEventMessage;
