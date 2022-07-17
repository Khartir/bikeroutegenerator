import { useAppDispatch, useAppSelector } from "../../state/hooks";
import { selectLength } from "../length/lengthSlice";
import { fetchRoute, resetRoute, selectRoute } from "./routeSlice";
import { selectStartPoint } from "../startPoint/startPointSlice";
import { Button } from "../../leaflet/Button";

export function CalcRoute() {
    const startPoint = useAppSelector(selectStartPoint);
    const route = useAppSelector(selectRoute);
    const length = useAppSelector(selectLength);
    const dispatch = useAppDispatch();
    if (!startPoint) {
        return null;
    }
    let label = "Calculate route";
    if (route) {
        label = "Calculate new route";
    }

    return (
        <Button
            label={label}
            onClick={() => {
                dispatch(resetRoute());
                dispatch(fetchRoute({ startPoint, length }));
            }}
        />
    );
}
