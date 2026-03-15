import { Feature, point, Polygon, Position, Properties } from "@turf/helpers";
import { LatLng } from "leaflet";
import {
    addDebugFeature,
    setGenerationStep,
    setCenterPoint,
    selectPolygonVertices,
    setPolygonVertices,
    selectRandomShape,
} from "../route/routeSlice";
import { AppDispatch, RootState } from "../state/store";
import { makeRandomRoute, generateGeometry, routeWithProfile, RouteGeometry } from "./imported/route";
import { makeRoute as routerMakeRoute } from "./imported/brouter";
import { waitForNextStep } from "../route/stepController";

export interface GetRouteArgs {
    startPoint: LatLng;
    length: number;
    profiles: Profile[];
    stepThroughMode: boolean;
}

/** Single-profile flow (used with step-through mode) */
export async function getWaypoints(
    { startPoint, length, profile, stepThroughMode }: { startPoint: LatLng; length: number; profile: Profile; stepThroughMode: boolean },
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

/** Multi-profile: generate geometry only (steps 1-2) */
export async function getGeometry(
    { startPoint, length, stepThroughMode }: GetRouteArgs,
    dispatch: AppDispatch,
    getState: () => RootState
): Promise<RouteGeometry> {
    const debug = getDebugSetters(dispatch, stepThroughMode);
    const startAsTurfPoint = point([startPoint.lng, startPoint.lat]);
    const enabledShapes = getState().route.options.enabledShapes;
    const shape = selectRandomShape(enabledShapes);
    return generateGeometry({
        startPoint: startAsTurfPoint,
        length,
        debug,
        shape,
        setStep: (step) => dispatch(setGenerationStep(step)),
    });
}

/** Multi-profile: run profile-dependent steps (3-5) on pre-generated geometry */
export async function getProfileRoute(
    geometry: RouteGeometry,
    profile: Profile,
    { stepThroughMode }: GetRouteArgs,
    dispatch: AppDispatch,
    _getState: () => RootState
): Promise<{ wayPoints: Position[]; route: Feature<import("@turf/helpers").LineString>[] }> {
    const debug = getDebugSetters(dispatch, stepThroughMode);
    dispatch(setGenerationStep("snapping_to_roads"));
    const wayPoints = await routeWithProfile(geometry, profile, debug, (step) => dispatch(setGenerationStep(step)));
    dispatch(setGenerationStep("calculating_route"));
    const route = await routerMakeRoute(wayPoints, profile, debug);
    return { wayPoints, route };
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
