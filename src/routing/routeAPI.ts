import { Feature, point, Position, Properties } from "@turf/helpers";
import { LatLng } from "leaflet";
import { addDebugFeature, setGenerationStep, setCenterPoint, selectPolygonVertices, setPolygonVertices } from "../route/routeSlice";
import { AppDispatch, RootState } from "../state/store";
import { makeRandomRoute } from "./imported/route";
import { makeRoute as routerMakeRoute } from "./imported/brouter";
import { waitForNextStep } from "../route/stepController";

export interface GetRouteArgs {
    startPoint: LatLng;
    length: number;
    profile: Profile;
    stepThroughMode: boolean;
}

export async function getWaypoints(
    { startPoint, length, profile, stepThroughMode }: GetRouteArgs,
    dispatch: AppDispatch,
    getState: () => RootState
) {
    const debug = getDebugSetters(dispatch, stepThroughMode);
    const startAsTurfPoint = point([startPoint.lng, startPoint.lat]);
    return makeRandomRoute({
        startPoint: startAsTurfPoint,
        length,
        profile,
        debug,
        setStep: (step) => dispatch(setGenerationStep(step)),
        waitForNextStep,
        setCenterPoint: (center) => dispatch(setCenterPoint(center)),
        getCenterPoint: () => getState().route.centerPoint,
        getPolygonVertices: () => selectPolygonVertices(getState()),
        setPolygonVertices: (vertices) => dispatch(setPolygonVertices(vertices)),
    });
}

export async function makeRoute(wayPoints: Position[], profile: Profile, debug: DebugSetters) {
    return routerMakeRoute(wayPoints, profile, debug);
}

export const profiles = {
    "fastbike-verylowtraffic": "[highway~'tertiary|unclassified']",
    trekking: "[highway]",
};

export type Profile = keyof typeof profiles;

export function getDebugSetters(dispatch: AppDispatch, isEnabled: boolean) {
    return {
        addDebugPosition: (position: Position, props?: Properties) =>
            isEnabled && dispatch(addDebugFeature(point(position, props))),
        addDebugFeature: (feature: Feature) => isEnabled && dispatch(addDebugFeature(feature)),
    };
}

export type DebugSetters = ReturnType<typeof getDebugSetters>;
