import { MapContainer, TileLayer } from "react-leaflet";
import { Debug } from "../route/Debug";
import { WayPoints } from "../route/WayPoints";
import { CenterPoint } from "../route/CenterPoint";
import { PolygonVertices } from "../route/PolygonVertices";
import { RouteForm } from "../route/RouteForm";
import { Route } from "../route/Route";
import { useAppSelector } from "../state/hooks";
import { selectCenter, selectZoom } from "./mapSlice";
import { PersistentCenter } from "./PersistentCenter";
import { selectStepThroughMode } from "../route/routeSlice";

export function Map() {
    const center = useAppSelector(selectCenter);
    const zoom = useAppSelector(selectZoom);
    const stepThroughMode = useAppSelector(selectStepThroughMode);
    return (
        <MapContainer center={center} zoom={zoom}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <PersistentCenter />
            <RouteForm />
            <WayPoints />
            <CenterPoint />
            <PolygonVertices />
            <Route />
            {stepThroughMode && <Debug />}
        </MapContainer>
    );
}
