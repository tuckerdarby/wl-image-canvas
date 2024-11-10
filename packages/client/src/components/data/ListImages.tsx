import { useListImages } from "@/hooks/useListImages";
import { useEffect } from "react";

export const ListImages = () => {
    const listImages = useListImages();

    useEffect(() => {
        listImages();
    }, []);

    return null;
};
