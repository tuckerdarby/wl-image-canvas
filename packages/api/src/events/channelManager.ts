import { IEventMessage } from "@wl-image-canvas/types";

type EventHandler = (event: IEventMessage) => void;

interface Channel {
    handlers: Set<EventHandler>;
}

interface ChannelOptions {
    metadata?: Record<string, unknown>;
}

export class ChannelManager {
    private channels: Map<string, Channel>;

    constructor() {
        this.channels = new Map<string, Channel>();
    }

    createChannel(channelId: string): string {
        const channel = this.channels.get(channelId);
        if (!channel) {
            this.channels.set(channelId, {
                handlers: new Set<EventHandler>(),
            });
        }

        return channelId;
    }

    addHandler(channelId: string, handler: EventHandler): boolean {
        const channel = this.channels.get(channelId);
        if (channel) {
            channel.handlers.add(handler);
            return true;
        }
        return false;
    }

    removeHandler(channelId: string, handler: EventHandler): void {
        const channel = this.channels.get(channelId);
        if (channel) {
            channel.handlers.delete(handler);
            if (channel.handlers.size === 0) {
                this.channels.delete(channelId);
            }
        }
    }

    sendToChannel(channelId: string, event: IEventMessage): boolean {
        const channel = this.channels.get(channelId);
        if (channel) {
            channel.handlers.forEach((handler) => {
                try {
                    handler(event);
                } catch (error) {
                    console.error(
                        `Error in channel ${channelId} handler:`,
                        error
                    );
                }
            });
            return true;
        }
        return false;
    }

    removeChannel(channelId: string): boolean {
        return this.channels.delete(channelId);
    }

    get activeChannels(): number {
        return this.channels.size;
    }
}
