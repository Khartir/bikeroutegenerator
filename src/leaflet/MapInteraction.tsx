import { CalcRoute } from "./CalcRoute";
import { StartPoint } from "./StartPoint";

export function MapInteraction() {
    return (
        <div style={{ position: "absolute", right: "10%", top: "10%", zIndex: 1000, display: "grid" }}>
            <StartPoint />
            <CalcRoute />
        </div>
    );
}
