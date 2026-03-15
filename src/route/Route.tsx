import { useEffect } from "react";
import { Polyline, useMap } from "react-leaflet";
import { useAppSelector } from "../state/hooks";
import { selectProfileRoutes, selectProfiles, selectShowElevationMap } from "./routeSlice";
import init from "leaflet-hotline";
import L from "leaflet";
import { turfToLatLng } from "../leaflet/leafletHelpers";
import { profileColors } from "./profileColors";

export function Route() {
    const profileRoutes = useAppSelector(selectProfileRoutes);
    const selectedProfiles = useAppSelector(selectProfiles);
    const map = useMap();
    const showElevationMap = useAppSelector(selectShowElevationMap);

    // Elevation hotline for the first profile only
    const firstProfile = selectedProfiles[0];
    const firstRoute = firstProfile ? profileRoutes[firstProfile]?.route : undefined;

    useEffect(() => {
        if (!showElevationMap || !firstRoute || firstRoute.length === 0) {
            return;
        }
        const lines = firstRoute.map((line) => line.geometry.coordinates.map(turfToLatLng)).flat();
        let options: { min?: number; max?: number } = { min: undefined, max: undefined };
        lines.forEach((coord) => {
            if (coord.alt === undefined) return;
            if (options.min === undefined || coord.alt < options.min) options.min = coord.alt;
            if (options.max === undefined || coord.alt > options.max) options.max = coord.alt;
        });
        const extendedLeaflet = init(L);
        const elevationMap = extendedLeaflet.hotline(lines, options);
        elevationMap.addTo(map);

        return () => {
            elevationMap?.removeFrom(map);
        };
    }, [firstRoute, map, showElevationMap]);

    if (showElevationMap) {
        return null;
    }

    return (
        <>
            {selectedProfiles.map((profile) => {
                const result = profileRoutes[profile];
                if (!result) return null;
                const color = profileColors[profile] ?? "#3388ff";
                return result.route.map((line, index) => (
                    <Polyline
                        positions={line.geometry.coordinates.map(turfToLatLng)}
                        key={`${profile}-${index}`}
                        pathOptions={{ color, weight: 4, opacity: 0.8 }}
                    />
                ));
            })}
        </>
    );
}
