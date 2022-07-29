import { Layer } from "leaflet";
import { useEffect } from "react";
import { Polyline, useMap } from "react-leaflet";
import { useAppSelector } from "../state/hooks";
import { selectBounds, selectRoute, selectShowElevationMap } from "./routeSlice";
//@ts-ignore
import L from "leaflet-hotline";
import { turfToLatLng } from "../leaflet/leafletHelpers";

export function Route() {
    const route = useAppSelector(selectRoute);
    const bounds = useAppSelector(selectBounds);
    const map = useMap();
    const showHotline = useAppSelector(selectShowElevationMap);
    useEffect(() => {
        let hotline: Layer | null = null;
        if (!showHotline || !route || route.length === 0) {
            return;
        }
        const lines = route.map((line) => line.geometry.coordinates.map(turfToLatLng)).flat();
        let options: { min?: number; max?: number } = {
            min: undefined,
            max: undefined,
        };
        lines.forEach((coord) => {
            if (coord.alt === undefined) {
                return;
            }
            if (options.min === undefined || coord.alt < options.min) {
                options.min = coord.alt;
            }

            if (options.max === undefined || coord.alt > options.max) {
                options.max = coord.alt;
            }
        });
        hotline = new L.hotline(lines, options) as Layer;
        hotline.addTo(map);
        if (bounds) {
            map.fitBounds(bounds);
        }
        return () => {
            hotline?.removeFrom(map);
        };
    }, [route, map, bounds, showHotline]);
    if (showHotline) {
        return null;
    }
    return (
        <>
            {route.map((line, index) => (
                <Polyline positions={line.geometry.coordinates.map(turfToLatLng)} key={index} />
            ))}
        </>
    );
}
