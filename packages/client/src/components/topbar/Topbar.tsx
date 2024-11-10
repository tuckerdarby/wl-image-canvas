import { useSortImages } from "@/hooks/useSortImages";
import { Button } from "../ui/button";
import { GenerateBox } from "./GenerateBox";
import { useImages } from "@/state/ImageContext";
import { OptionsDropDown } from "./OptionsDropdown";

export const Topbar = () => {
    const images = useImages();
    const sortImages = useSortImages();

    return (
        <div className="absolute mt-8 w-full" style={{ zIndex: 3 }}>
            <div className="flex justify-center w-full">
                <div className="flex gap-4">
                    <GenerateBox />
                    <Button
                        onClick={() => sortImages(images)}
                        className="bg-gradient-to-r from-purple-700 to-blue-600 hover:from-purple-600 hover:to-blue-600"
                    >
                        Arrange to Grid
                    </Button>
                    <OptionsDropDown />
                </div>
            </div>
        </div>
    );
};
