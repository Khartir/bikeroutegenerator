import { Position } from "@turf/helpers";
import { LatLng } from "leaflet";
import { Marker, Polyline, Popup } from "react-leaflet";
import { useAppSelector } from "../state/hooks";
import { selectDebugFeatures } from "./routeSlice";

export function Debug() {
    const features = useAppSelector(selectDebugFeatures);

    return (
        <>
            {features.map(({ geometry, properties }, index) => {
                if (index === 0) {
                    // skip start point
                    return;
                }
                if (geometry.type === "Point") {
                    return (
                        <Marker position={turfToLatLng(geometry.coordinates as Position)}>
                            {properties?.debugLabel && <Popup>{properties.debugLabel}</Popup>}
                        </Marker>
                    );
                }
                if (geometry.type === "Polygon") {
                    return (
                        <Polyline positions={(geometry.coordinates[0] as Position[]).map(turfToLatLng)}>
                            {properties?.debugLabel && <Popup>{properties.debugLabel}</Popup>}
                        </Polyline>
                    );
                }
                if (geometry.type === "LineString") {
                    return (
                        <Polyline positions={(geometry.coordinates as Position[]).map(turfToLatLng)}>
                            {properties?.debugLabel && <Popup>{properties.debugLabel}</Popup>}
                        </Polyline>
                    );
                }
                console.error("unknown geometry type" + geometry.type);
            })}
        </>
    );
}

function turfToLatLng(point: Position) {
    return new LatLng(point[1], point[0], point[2]);
}
