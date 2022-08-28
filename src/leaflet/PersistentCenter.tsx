import { useMap, useMapEvents } from "react-leaflet";
import { useAppDispatch } from "../state/hooks";
import { tupleFromLatLng } from "./leafletHelpers";
import { changeZoom, moveCenter } from "./mapSlice";

export function PersistentCenter() {
    const map = useMap();
    const dispatch = useAppDispatch();
    useMapEvents({
        dragend: () => {
            dispatch(moveCenter(tupleFromLatLng(map.getCenter())));
        },
        zoomend: () => {
            dispatch(changeZoom({ center: tupleFromLatLng(map.getCenter()), zoom: map.getZoom() }));
        },
    });
    return null;
}
