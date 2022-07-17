import { MapContainer, TileLayer } from "react-leaflet";
import { Route } from "../route/Route";
import { RouteForm } from "../route/RouteForm";

export function Map() {
    return (
        <MapContainer center={[49.78798721874146, 9.968176237899439]} zoom={13}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <RouteForm />
            <Route />
        </MapContainer>
    );
}
