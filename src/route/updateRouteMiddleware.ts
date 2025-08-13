import { createListenerMiddleware, isAnyOf, TypedStartListening } from "@reduxjs/toolkit";
import { makeRoute } from "../routing/imported/brouter";
import { AppDispatch, RootState } from "../state/store";
import { moveStartPoint, moveWayPoint, updateRoute } from "./routeSlice";
import { getDebugSetters } from "../routing/routeAPI";

const listenerMiddleware = createListenerMiddleware();

export const { middleware } = listenerMiddleware;

type AppStartListening = TypedStartListening<RootState, AppDispatch>;

(listenerMiddleware.startListening as AppStartListening)({
    matcher: isAnyOf(moveStartPoint, moveWayPoint),
    effect: async function dragRouteStartPoint({ payload: { index = 0 } }, { dispatch, cancelActiveListeners, getState }) {
        cancelActiveListeners();
        const {
            route: {
                wayPoints,
                options: { profile },
                route,
            },
        } = getState();
        const lastIndex = wayPoints.length - 1;
        if (lastIndex > 0) {
            const points = [
                wayPoints[(index + lastIndex - 1) % lastIndex],
                wayPoints[index],
                wayPoints[(index + lastIndex + 1) % lastIndex],
            ];

            const partialRoute = await makeRoute(points, profile, getDebugSetters(dispatch));
            const newRoute = [...route];

            newRoute[(index + lastIndex - 1) % lastIndex] = partialRoute[0];
            newRoute[index] = partialRoute[1];
            dispatch(updateRoute(newRoute));
        }
    },
});
