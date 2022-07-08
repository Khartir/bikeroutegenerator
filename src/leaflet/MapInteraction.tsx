import { LatLng, LeafletMouseEvent } from "leaflet";
import { useState } from "react";
import { useMapEvents } from "react-leaflet";
import { Router } from "../routing/Router";

export function MapInteraction() {
    const [position, setPosition] = useState<LatLng | null>(null);
    useMapEvents({
        click(e: LeafletMouseEvent) {
            setPosition(e.latlng);
        },
    });

    return <>{position && <Router start={position} />}</>;
}
