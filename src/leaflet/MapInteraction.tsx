import { LeafletMouseEvent } from "leaflet";
import { Marker, useMapEvents } from "react-leaflet";
import { Router } from "../routing/Router";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { selectStartPoint, setStartPoint } from "../state/startPoint";
import { StartPoint } from "./StartPoint";

export function MapInteraction() {
    return (
        <>
            <StartPoint />
        </>
    );

    // return <>{position && <Router start={position} />}</>;
}
