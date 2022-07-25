import { useCallback } from "react";
import L, { LatLng } from "leaflet";
import { Position } from "@turf/helpers";

export const useRegisterWithLeaflet = () => {
    return useCallback((node: HTMLElement | null) => {
        if (node) {
            L.DomEvent.disableClickPropagation(node);
        }
    }, []);
};

export function turfToLatLng(point: Position) {
    return new LatLng(point[1], point[0], point[2]);
}
