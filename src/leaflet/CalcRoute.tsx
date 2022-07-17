import { useAppDispatch, useAppSelector } from "../state/hooks";
import { selectLength } from "../state/length";
import { fetchRoute, resetRoute, selectRoute } from "../state/route";
import { selectStartPoint } from "../state/startPoint";
import { Button } from "./Button";

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
