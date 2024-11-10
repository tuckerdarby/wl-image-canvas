import { CanvasContainer } from "@/components/canvas/CanvasContainer";
import { ImageProvider } from "./state/ImageContext";
import { Topbar } from "./components/topbar/Topbar";
import { SelectedProvider } from "./state/SelectedContext";
import { Toaster } from "@/components/ui/sonner";
import { SSEProvider } from "./state/EventsContext";
import { ListImages } from "./components/data/ListImages";

function App() {
    return (
        <ImageProvider>
            <SelectedProvider>
                <SSEProvider />
                <ListImages />
                <div className="relative">
                    <CanvasContainer />
                    <div className="fixed top-0 left-0 right-0 z-10">
                        <Topbar />
                    </div>
                </div>
                <Toaster />
            </SelectedProvider>
        </ImageProvider>
    );
}

export default App;
