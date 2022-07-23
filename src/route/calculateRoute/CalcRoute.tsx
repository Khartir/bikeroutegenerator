import { useAppDispatch, useAppSelector } from "../../state/hooks";
import {
    fetchRoute,
    resetRoute,
    selectDesiredLength,
    selectRoute,
    selectStartPoint,
    selectProfile,
} from "../routeSlice";
import { Button } from "../../leaflet/Button";
import { messages } from "../../localization/localization";
import Route from "@mui/icons-material/Route";
import AltRoute from "@mui/icons-material/AltRoute";

export function CalcRoute() {
    const startPoint = useAppSelector(selectStartPoint);
    const route = useAppSelector(selectRoute);
    const length = useAppSelector(selectDesiredLength);
    const profile = useAppSelector(selectProfile);
    const dispatch = useAppDispatch();
    if (!startPoint || !profile) {
        return null;
    }
    let label = messages.calculateRoute.firstRoute;
    let Icon = Route;
    if (route) {
        label = messages.calculateRoute.newRoute;
        Icon = AltRoute;
    }

    return (
        <Button
            label={label}
            onClick={() => {
                dispatch(resetRoute());
                dispatch(fetchRoute({ startPoint, length, profile }));
            }}
        >
            <Icon />
        </Button>
    );
}
