import { IImageModel } from "./imageType";

export enum EventMessageType {
    UPDATE_IMAGE = "UPDATE_IMAGE",
}

export type MessageDataType = IImageModel;

export interface IEventMessage {
    type: EventMessageType;
    data: MessageDataType;
}
