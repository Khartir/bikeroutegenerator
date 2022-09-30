import { Feature, point, Position, Properties } from "@turf/helpers";
import { LatLng } from "leaflet";
import { addDebugFeature } from "../route/routeSlice";
import { AppDispatch } from "../state/store";
import { debugEnabled } from "./imported/debug";
import { makeRandomRoute } from "./imported/route";
import { makeRoute as routerMakeRoute } from "./imported/brouter";

export interface GetRouteArgs {
    startPoint: LatLng;
    length: number;
    profile: Profile;
}

export async const  getWaypoints = ({ startPoint, length, profile }: GetRouteArgs) => (dispatch: AppDispatch) => {
    const debug = getDebugSetters(dispatch);
    const startAsTurfPoint = point([startPoint.lng, startPoint.lat]);
    return makeRandomRoute({ startPoint: startAsTurfPoint, length, profile, debug });
}

export async function makeRoute(wayPoints: Position[], profile: Profile, dispatch: AppDispatch) {
    const debug = getDebugSetters(dispatch);
    return routerMakeRoute(wayPoints, profile, debug);
}

export const profiles = {
    "fastbike-verylowtraffic": "[highway~'tertiary|unclassified']",
    trekking: "[highway]",
};

export type Profile = keyof typeof profiles;

export function getDebugSetters(dispatch: AppDispatch) {
    return {
        addDebugPosition: (position: Position, props?: Properties) =>
            debugEnabled && dispatch(addDebugFeature(point(position, props))),
        addDebugFeature: (feature: Feature) => debugEnabled && dispatch(addDebugFeature(feature)),
    };
}

export type DebugSetters = ReturnType<typeof getDebugSetters>;
