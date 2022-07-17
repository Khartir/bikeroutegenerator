import { LeafletMouseEvent } from "leaflet";
import { Marker, useMapEvents } from "react-leaflet";
import { useAppDispatch, useAppSelector } from "../../state/hooks";
import { selectStartPoint, setStartPoint, unsetStartPoint } from "./startPointSlice";
import { Button } from "../../leaflet/Button";

export function StartPoint() {
    const startPoint = useAppSelector(selectStartPoint);
    const dispatch = useAppDispatch();
    useMapEvents({
        click(e: LeafletMouseEvent) {
            if (!startPoint) {
                dispatch(setStartPoint({ ...e.latlng }));
            }
        },
    });

    if (!startPoint) {
        return null;
    }

    return (
        <>
            <Marker position={startPoint} />
            <Button label="New start point" onClick={() => dispatch(unsetStartPoint())} />
        </>
    );
}
