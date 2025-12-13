import { Feature, point, Position, Properties } from "@turf/helpers";
import { LatLng } from "leaflet";
import { addDebugFeature, setGenerationStep, GenerationStep } from "../route/routeSlice";
import { AppDispatch } from "../state/store";
import { makeRandomRoute } from "./imported/route";
import { makeRoute as routerMakeRoute } from "./imported/brouter";

export interface GetRouteArgs {
    startPoint: LatLng;
    length: number;
    profile: Profile;
    showIntermediateSteps: boolean;
}

export async function getWaypoints({ startPoint, length, profile, showIntermediateSteps }: GetRouteArgs, dispatch: AppDispatch) {
    const debug = getDebugSetters(dispatch, showIntermediateSteps);
    const startAsTurfPoint = point([startPoint.lng, startPoint.lat]);
    return makeRandomRoute({ startPoint: startAsTurfPoint, length, profile, debug, setStep: (step) => dispatch(setGenerationStep(step)) });
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
