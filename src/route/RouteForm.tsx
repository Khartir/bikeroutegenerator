import { CalcRoute } from "./calculateRoute/CalcRoute";
import { Download } from "./Download";
import { Length } from "./length/Length";
import { StartPoint } from "./startPoint/StartPoint";

export function RouteForm() {
    return (
        <div style={{ position: "absolute", right: "10%", top: "10%", zIndex: 1000, display: "grid" }}>
            <Length />
            <StartPoint />
            <CalcRoute />
            <Download />
        </div>
    );
}
