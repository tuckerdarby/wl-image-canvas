import React, {
    createContext,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import { useLoadImage, useRemoveImage } from "./ImageContext";
import { EventMessageType, EventMessage } from "@wl-image-canvas/types";
import { toast } from "sonner";

interface SSEContextType {}

const SSEContext = createContext<SSEContextType | undefined>(undefined);

export const SSEProvider: React.FC = ({}) => {
    const [eventSource, setEventSource] = useState<EventSource | null>(null);
    const [connected, setConnected] = useState(false);
    const loadImage = useLoadImage();
    const removeImage = useRemoveImage();

    const handleEvent = useCallback(
        (message: MessageEvent<any>) => {
            const event = JSON.parse(message.data) as EventMessage;
            if (event.type === EventMessageType.UPDATE_IMAGE) {
                loadImage(event.data.id, event.data);
            } else if (event.type === EventMessageType.IMAGE_ERROR) {
                // Instead of just removing the image, we could display an error image and allow the user to retry
                // This is just a quick and dirty way of handling it for time's sake
                toast(event.data.message);
                removeImage(event.data.id);
            }
        },
        [loadImage]
    );

    useEffect(() => {
        if (!eventSource) {
            return;
        }
        eventSource.onmessage = handleEvent;
    }, [eventSource, handleEvent]);

    const connect = () => {
        if (connected) {
            return;
        }

        const newEventSource = new EventSource(`/api/events`);

        newEventSource.onopen = () => setConnected(true);

        newEventSource.onerror = () => {
            console.error(`Unable to connect to event source`);
            setConnected(false);
            newEventSource.close();
        };

        setConnected(true);
        setEventSource(newEventSource);
    };

    useEffect(() => {
        if (!connected) {
            connect();
        }
    }, [connected, connect, setConnected, setEventSource]);

    const disconnect = () => {
        if (eventSource) {
            eventSource.close();
            setEventSource(null);
            setConnected(false);
        }
    };

    useEffect(() => {
        return () => disconnect();
    }, []);

    const state = useMemo(() => ({}), []);

    return <SSEContext.Provider value={state} />;
};
