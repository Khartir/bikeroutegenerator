import { Button } from "../../leaflet/Button";
import {CenterFocusStrong} from "@mui/icons-material";
import { useMap } from "react-leaflet";
import { useAppDispatch, useAppSelector } from "../../state/hooks";
import { toggleFitToBounds, selectBounds, selectFitToBounds } from "../routeSlice";
import { messages } from "../../localization/localization";
import { useEffect } from "react";

export function CenterRoute() {
    const map = useMap();
    const bounds = useAppSelector(selectBounds);
    const fitToBounds = useAppSelector(selectFitToBounds);
    const dispatch = useAppDispatch();
    useEffect(() => {
        if (!fitToBounds || !bounds) {
            return;
        }
        map.fitBounds(bounds);
        dispatch(toggleFitToBounds());
    }, [fitToBounds, bounds, map]);

    return (
        bounds && (
            <Button
                label={messages.position.centerRoute}
                onClick={() => {
                    map.fitBounds(bounds);
                }}
            >
                <CenterFocusStrong />
            </Button>
        )
    );
}
