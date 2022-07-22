import { GPX, LatLngBounds } from "leaflet";
import * as L from "leaflet-gpx";
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { selectRoute } from "./calculateRoute/routeSlice";
import { setBounds } from "./position/boundsSlice";

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
                const bounds: LatLngBounds = e.target.getBounds();
                dispatch(
                    setBounds({
                        southWest: { ...bounds.getSouthWest() },
                        northEast: { ...bounds.getNorthEast() },
                    })
                );
                map.fitBounds(e.target.getBounds());
            }).addTo(map);
        }
        return () => {
            gpx?.removeFrom(map);
        };
    }, [route, map]);
    return null;
}
