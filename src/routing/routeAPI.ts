import { Feature, point, Position, Properties } from "@turf/helpers";
import { LatLng } from "leaflet";
import { addDebugFeature, setGenerationStep, setCenterPoint, selectPolygonVertices, setPolygonVertices, selectRandomShape } from "../route/routeSlice";
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
    const enabledShapes = getState().route.options.enabledShapes;
    const shape = selectRandomShape(enabledShapes);
    return makeRandomRoute({
        startPoint: startAsTurfPoint,
        length,
        profile,
        debug,
        shape,
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

export interface ProfileConfig {
    brouterProfile: string;
    overpassFilter: (radius: number, lat: number, lon: number) => string;
    label: string;
}

export const profiles: Record<string, ProfileConfig> = {
    "trike-safe": {
        brouterProfile: "trike-safe",
        label: "Trike Safe",
        overpassFilter: (radius, lat, lon) =>
            `way[highway~'cycleway|residential|tertiary|unclassified|living_street'](around:${radius},${lat},${lon});`,
    },
    "trike-touring": {
        brouterProfile: "trike-touring",
        label: "Trike Touring",
        overpassFilter: (radius, lat, lon) =>
            `way[highway~'cycleway|residential|tertiary|unclassified|secondary|living_street'](around:${radius},${lat},${lon});
  way[highway=track][tracktype=grade1](around:${radius},${lat},${lon});`,
    },
    "trike-gravel": {
        brouterProfile: "trike-gravel",
        label: "Trike Gravel",
        overpassFilter: (radius, lat, lon) =>
            `way[highway~'cycleway|residential|tertiary|unclassified|secondary|living_street'](around:${radius},${lat},${lon});
  way[highway=track][tracktype~'grade1|grade2|grade3'](around:${radius},${lat},${lon});`,
    },
    "trike-explorer": {
        brouterProfile: "trike-explorer",
        label: "Trike Explorer",
        overpassFilter: (radius, lat, lon) =>
            `way[highway~'cycleway|residential|tertiary|unclassified|secondary|living_street|service|track'](around:${radius},${lat},${lon});`,
    },
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
