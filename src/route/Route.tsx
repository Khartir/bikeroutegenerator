import { useEffect } from "react";
import { Polyline, useMap } from "react-leaflet";
import { useAppSelector } from "../state/hooks";
import { selectRoute, selectShowElevationMap } from "./routeSlice";
//@ts-ignore
import L from "leaflet-hotline";
import { turfToLatLng } from "../leaflet/leafletHelpers";

export function Route() {
    const route = useAppSelector(selectRoute);
    const map = useMap();
    const showElevationMap = useAppSelector(selectShowElevationMap);
    useEffect(() => {
        if (!showElevationMap) {
            return;
        }
        if (route.length === 0) {
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
        const elevationMap = new L.hotline(lines, options);
        elevationMap.addTo(map);

        return () => {
            elevationMap?.removeFrom(map);
        };
    }, [route, map, showElevationMap]);
    if (showElevationMap) {
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
