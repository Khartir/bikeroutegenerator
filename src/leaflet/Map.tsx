import { MapContainer, TileLayer } from "react-leaflet";
import { Debug } from "../route/Debug";
import { WayPoints } from "../route/WayPoints";
import { RouteForm } from "../route/RouteForm";
import { debugEnabled } from "../routing/imported/debug";
import { Route } from "../route/Route";
import { useAppSelector } from "../state/hooks";
import { selectCenter, selectZoom } from "./mapSlice";
import { PersistentCenter } from "./PersistentCenter";

export function Map() {
    const center = useAppSelector(selectCenter);
    const zoom = useAppSelector(selectZoom);
    return (
        <MapContainer center={center} zoom={zoom}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <PersistentCenter />
            <RouteForm />
            <WayPoints />
            <Route />
            {debugEnabled && <Debug />}
        </MapContainer>
    );
}
