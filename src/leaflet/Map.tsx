import { MapContainer, TileLayer } from "react-leaflet";
import { Debug } from "../route/Debug";
import { WayPoints } from "../route/WayPoints";
import { RouteForm } from "../route/RouteForm";
import { debugEnabled } from "../routing/imported/debug";
import { Route } from "../route/Route";

export function Map() {
    return (
        <MapContainer center={[49.78798721874146, 9.968176237899439]} zoom={13}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <RouteForm />
            <WayPoints />
            <Route />
            {debugEnabled && <Debug />}
        </MapContainer>
    );
}
