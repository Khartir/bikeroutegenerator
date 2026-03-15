import { createListenerMiddleware, isAnyOf, TypedStartListening } from "@reduxjs/toolkit";
import { makeRoute, setBrouterBaseUrl } from "../routing/imported/brouter";
import { AppDispatch, RootState } from "../state/store";
import { moveStartPoint, moveWayPoint, moveProfileWayPoint, updateRoute, updateProfileRoute } from "./routeSlice";
import { getDebugSetters } from "../routing/routeAPI";

const listenerMiddleware = createListenerMiddleware();

export const { middleware } = listenerMiddleware;

type AppStartListening = TypedStartListening<RootState, AppDispatch>;

// Single-profile waypoint/start-point dragging
(listenerMiddleware.startListening as AppStartListening)({
    matcher: isAnyOf(moveStartPoint, moveWayPoint),
    effect: async ({ payload: { index = 0 } }, { dispatch, cancelActiveListeners, getState }) => {
        cancelActiveListeners();
        const {
            route: {
                wayPoints,
                options: { profiles, brouterUrl },
                route,
                stepThroughMode,
            },
        } = getState();
        const profile = profiles[0] ?? "";
        if (!profile) return;
        setBrouterBaseUrl(brouterUrl);
        const lastIndex = wayPoints.length - 1;
        if (lastIndex > 0) {
            const points = [
                wayPoints[(index + lastIndex - 1) % lastIndex],
                wayPoints[index],
                wayPoints[(index + lastIndex + 1) % lastIndex],
            ];

            const partialRoute = await makeRoute(points, profile, getDebugSetters(dispatch, stepThroughMode));
            const newRoute = [...route];

            newRoute[(index + lastIndex - 1) % lastIndex] = partialRoute[0];
            newRoute[index] = partialRoute[1];
            dispatch(updateRoute(newRoute));
        }
    },
});

// Multi-profile waypoint dragging
(listenerMiddleware.startListening as AppStartListening)({
    actionCreator: moveProfileWayPoint,
    effect: async ({ payload: { profile, index } }, { dispatch, cancelActiveListeners, getState }) => {
        cancelActiveListeners();
        const {
            route: {
                profileRoutes,
                options: { brouterUrl },
                stepThroughMode,
            },
        } = getState();
        const result = profileRoutes[profile];
        if (!result) return;
        setBrouterBaseUrl(brouterUrl);
        const wayPoints = result.wayPoints;
        const route = result.route;
        const lastIndex = wayPoints.length - 1;
        if (lastIndex > 0) {
            const points = [
                wayPoints[(index + lastIndex - 1) % lastIndex],
                wayPoints[index],
                wayPoints[(index + lastIndex + 1) % lastIndex],
            ];

            const partialRoute = await makeRoute(points, profile, getDebugSetters(dispatch, stepThroughMode));
            const newRoute = [...route];

            newRoute[(index + lastIndex - 1) % lastIndex] = partialRoute[0];
            newRoute[index] = partialRoute[1];
            dispatch(updateProfileRoute({ profile, route: newRoute }));
        }
    },
});
