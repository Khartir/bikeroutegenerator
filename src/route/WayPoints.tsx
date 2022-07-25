import { LeafletMouseEvent } from "leaflet";
import { Marker } from "react-leaflet";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { moveWayPoint, selectWayPoints } from "./routeSlice";
import { turfToLatLng } from "../leaflet/leafletHelpers";

export function WayPoints() {
    const wayPoints = useAppSelector(selectWayPoints);
    const dispatch = useAppDispatch();
    if (!wayPoints) {
        return null;
    }
    return (
        <>
            {wayPoints.map((wayPoint, index) => (
                <Marker
                    position={turfToLatLng(wayPoint)}
                    key={index}
                    // draggable
                    eventHandlers={{
                        move: (e) =>
                            dispatch(
                                moveWayPoint({
                                    index,
                                    position: [
                                        (e as LeafletMouseEvent).latlng.lng,
                                        (e as LeafletMouseEvent).latlng.lat,
                                    ],
                                })
                            ),
                    }}
                />
            ))}
        </>
    );
}
