import { Position } from "@turf/helpers";
import { LatLng } from "leaflet";
import { Polyline } from "react-leaflet";
import { useAppSelector } from "../state/hooks";
import { selectRoute } from "./routeSlice";

export function Route() {
    const route = useAppSelector(selectRoute);
    if (!route) {
        return null;
    }
    console.log(route);
    return (
        <>
            {route.map((line, index) => (
                <Polyline positions={line.geometry.coordinates.map(turfToLatLng)} key={index} />
            ))}
        </>
    );
}

function turfToLatLng(point: Position) {
    return new LatLng(point[1], point[0], point[2]);
}
