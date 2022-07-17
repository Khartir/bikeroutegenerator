import { useCallback } from "react";
import L from "leaflet";

export const useRegisterWithLeaflet = () => {
    return useCallback((node: HTMLElement | null) => {
        if (node) {
            L.DomEvent.disableClickPropagation(node);
        }
    }, []);
};
