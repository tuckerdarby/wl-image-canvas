import { CanvasContainer } from "@/components/canvas/CanvasContainer";
import { ImageProvider } from "./state/ImageContext";
import { Topbar } from "./components/topbar/Topbar";

function App() {
    return (
        <ImageProvider>
            <div className="relative">
                <CanvasContainer />
                <div className="fixed top-0 left-0 right-0 z-10">
                    <Topbar />
                </div>
            </div>
        </ImageProvider>
    );
}

export default App;
