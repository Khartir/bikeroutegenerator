import { GPX } from "leaflet";
import * as L from "leaflet-gpx";
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { useAppSelector } from "../state/hooks";
import { selectRoute } from "./calculateRoute/routeSlice";

export function Route() {
    const route = useAppSelector(selectRoute);
    const map = useMap();
    useEffect(() => {
        let gpx: null | GPX = null;
        if (route) {
            //@ts-ignore
            gpx = new L.GPX(route, { async: true, marker_options: { startIconUrl: null, endIconUrl: null } }) as GPX;

            gpx.on("loaded", function (e) {
                map.fitBounds(e.target.getBounds());
            }).addTo(map);
        }
        return () => {
            gpx?.removeFrom(map);
        };
    }, [route, map]);
    return null;
}
