import { useAppDispatch, useAppSelector } from "../../state/hooks";
import {
    fetchWayPointsAndRoute,
    resetRoute,
    selectDesiredLength,
    selectRoute,
    selectStartPoint,
    selectProfile,
    selectShowIntermediateSteps,
} from "../routeSlice";
import { Button } from "../../leaflet/Button";
import { messages } from "../../localization/localization";
import {Route, AltRoute} from "@mui/icons-material";

export function CalcRoute() {
    const startPoint = useAppSelector(selectStartPoint);
    const route = useAppSelector(selectRoute);
    const length = useAppSelector(selectDesiredLength);
    const profile = useAppSelector(selectProfile);
    const showIntermediateSteps = useAppSelector(selectShowIntermediateSteps);
    const dispatch = useAppDispatch();
    if (!startPoint || !profile) {
        return null;
    }
    let label = messages.calculateRoute.firstRoute;
    let Icon = Route;
    if (route.length !== 0) {
        label = messages.calculateRoute.newRoute;
        Icon = AltRoute;
    }

    return (
        <Button
            label={label}
            onClick={() => {
                dispatch(resetRoute(false));
                dispatch(fetchWayPointsAndRoute({ startPoint, length, profile, showIntermediateSteps }));
            }}
        >
            <Icon />
        </Button>
    );
}
