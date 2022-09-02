import { LeafletMouseEvent } from "leaflet";
import { Marker, useMapEvents } from "react-leaflet";
import { useAppDispatch, useAppSelector } from "../../state/hooks";
import { selectStartPoint, setStartPoint, resetRoute, moveStartPoint } from "../routeSlice";
import { Button } from "../../leaflet/Button";
import { messages } from "../../localization/localization";
import { Delete } from "@mui/icons-material";
import { Divider } from "@mui/material";

export function StartPoint() {
    const startPoint = useAppSelector(selectStartPoint);
    const dispatch = useAppDispatch();
    useMapEvents({
        click(e) {
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
            <Divider />
            <Marker
                position={startPoint}
                eventHandlers={{ move: (e) => dispatch(moveStartPoint({ ...(e as LeafletMouseEvent).latlng })) }}
            />
            <Button label={messages.startPoint.new} onClick={() => dispatch(resetRoute(true))}>
                <Delete />
            </Button>
        </>
    );
}
