import { CalcRoute } from "./CalcRoute";
import { Download } from "./Download";
import { Length } from "./Length";
import { StartPoint } from "./StartPoint";

export function MapInteraction() {
    return (
        <div style={{ position: "absolute", right: "10%", top: "10%", zIndex: 1000, display: "grid" }}>
            <Length />
            <StartPoint />
            <CalcRoute />
            <Download />
        </div>
    );
}
