import { GPX } from "leaflet";
import { useMap } from "react-leaflet";
import { Button } from "./Button";

export function Controls({ gpx }: { gpx: GPX | null }) {
    const map = useMap();
    return <Button label="Delete" onClick={() => map.removeLayer(gpx!)} />;
}
