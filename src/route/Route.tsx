import { GPX, LatLngBounds } from "leaflet";
import * as L from "leaflet-gpx";
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { selectRoute, gpxParsed } from "./routeSlice";

export function Route() {
    const route = useAppSelector(selectRoute);
    const map = useMap();
    const dispatch = useAppDispatch();
    useEffect(() => {
        let gpx: null | GPX = null;
        if (route) {
            //@ts-ignore
            gpx = new L.GPX(route, { async: true, marker_options: { startIconUrl: null, endIconUrl: null } }) as GPX;

            gpx.on("loaded", function (e) {
                const gpx: GPX = e.target;
                const bounds: LatLngBounds = gpx.getBounds();
                dispatch(
                    gpxParsed({
                        bounds: {
                            southWest: { ...bounds.getSouthWest() },
                            northEast: { ...bounds.getNorthEast() },
                        },
                        distance: gpx.get_distance(),
                        elevation: gpx.get_elevation_gain(),
                    })
                );
                map.fitBounds(bounds);
            }).addTo(map);
        }
        return () => {
            gpx?.removeFrom(map);
        };
    }, [route, map]);
    return null;
}
