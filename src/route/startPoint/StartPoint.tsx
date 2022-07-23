import { LeafletMouseEvent } from "leaflet";
import { Marker, useMapEvents } from "react-leaflet";
import { useAppDispatch, useAppSelector } from "../../state/hooks";
import { selectStartPoint, setStartPoint, resetRoute } from "../routeSlice";
import { Button } from "../../leaflet/Button";
import { messages } from "../../localization/localization";
import EditLocationAlt from "@mui/icons-material/EditLocationAlt";
import Divider from "@mui/material/Divider";

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
            <Divider />
            <Marker position={startPoint} />
            <Button label={messages.startPoint.new} onClick={() => dispatch(resetRoute(true))}>
                <EditLocationAlt />
            </Button>
        </>
    );
}
