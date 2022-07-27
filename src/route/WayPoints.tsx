import { LeafletMouseEvent } from "leaflet";
import { Marker } from "react-leaflet";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { moveWayPoint, selectWayPoints } from "./routeSlice";
import { turfToLatLng } from "../leaflet/leafletHelpers";

export function WayPoints() {
    const wayPoints = useAppSelector(selectWayPoints);
    const dispatch = useAppDispatch();
    const lastIndex = wayPoints.length - 1;
    if (lastIndex <= 0) {
        return null;
    }

    return (
        <>
            {wayPoints.map((wayPoint, index) => {
                if (index === 0 || index === lastIndex) {
                    return null;
                }
                return (
                    <Marker
                        position={turfToLatLng(wayPoint)}
                        key={index}
                        draggable
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
                );
            })}
        </>
    );
}
