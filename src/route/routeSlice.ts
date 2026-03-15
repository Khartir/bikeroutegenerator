import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Feature, LineString, Position } from "@turf/helpers";
import { LatLng, LatLngBounds, FeatureGroup, Polyline } from "leaflet";
import { turfToLatLng } from "../leaflet/leafletHelpers";
import {
    getWaypoints,
    getGeometry,
    getProfileRoute,
    GetRouteArgs,
    Profile,
    makeRoute,
    getDebugSetters,
    profiles,
} from "../routing/routeAPI";
import { setBrouterBaseUrl } from "../routing/imported/brouter";
import { setOverpassBaseUrl } from "../routing/imported/overpass";
import { AppDispatch, RootState } from "../state/store";
import { configureStepController, resetStepController } from "./stepController";

export const fetchWayPointsAndRoute = createAsyncThunk(
    "route/newWayPoints",
    async (args: GetRouteArgs, { dispatch, getState }) => {
        const initialState = getState() as RootState;
        const selectedProfiles = args.profiles;
        const useMultiProfile = !initialState.route.stepThroughMode && selectedProfiles.length > 1;
        console.log("[multi-profile] selectedProfiles:", selectedProfiles, "stepThroughMode:", initialState.route.stepThroughMode, "useMultiProfile:", useMultiProfile);

        configureStepController(
            initialState.route.stepThroughMode,
            (waiting) => dispatch(setWaitingForNextStep(waiting))
        );

        // Set API URLs from settings
        setBrouterBaseUrl(initialState.route.options.brouterUrl);
        setOverpassBaseUrl(initialState.route.options.overpassUrl);

        try {
            dispatch(clearDebugFeatures());

            if (useMultiProfile) {
                // Multi-profile: generate geometry once, then run each profile through snapping+routing
                const totalProfiles = selectedProfiles.length;
                console.log("[multi-profile] generating geometry...");
                const geometry = await getGeometry(args, dispatch as AppDispatch, getState as () => RootState);
                console.log("[multi-profile] geometry generated, processing", totalProfiles, "profiles");

                for (let i = 0; i < selectedProfiles.length; i++) {
                    const profile = selectedProfiles[i];
                    console.log("[multi-profile] starting profile", i + 1, "/", totalProfiles, ":", profile);
                    dispatch(setProfileProgress({ current: i + 1, total: totalProfiles, profileName: profiles[profile].label }));

                    const { wayPoints, route } = await getProfileRoute(
                        geometry,
                        profile,
                        args,
                        dispatch as AppDispatch,
                        getState as () => RootState
                    );

                    console.log("[multi-profile] profile", profile, "done, wayPoints:", wayPoints.length, "route segments:", route.length);
                    dispatch(setProfileRouteResult({ profile, wayPoints, route }));
                }

                dispatch(toggleFitToBounds());
                dispatch(setProfileProgress(null));
                dispatch(setGenerationStep("done"));
            } else {
                // Single-profile: original flow with step-through support
                const profile = selectedProfiles[0];
                const wayPoints = await getWaypoints(
                    { ...args, profile },
                    dispatch as AppDispatch,
                    getState as () => RootState
                );

                dispatch(setWayPoints(wayPoints));

                const state = getState() as RootState;
                const debug = getDebugSetters(dispatch as AppDispatch, state.route.stepThroughMode);
                dispatch(setGenerationStep("calculating_route"));
                const route = await makeRoute(wayPoints, profile, debug);

                dispatch(setProfileRouteResult({ profile, wayPoints, route }));
                dispatch(toggleFitToBounds());
                dispatch(setGenerationStep("done"));
            }
        } finally {
            resetStepController();
        }
    }
);

export interface PseudoLatLng {
    lat: number;
    lng: number;
    alt?: number | undefined;
}

interface PseudoLatLngBounds {
    southWest: PseudoLatLng;
    northEast: PseudoLatLng;
}

interface GPXData {
    bounds: PseudoLatLngBounds | null;
    distance: number;
    elevation: number;
}

export interface RouteResult {
    route: Feature<LineString>[];
    wayPoints: Position[];
    distance: number;
    elevation: number;
    bounds: PseudoLatLngBounds | null;
}

export interface ProfileProgress {
    current: number;
    total: number;
    profileName: string;
}

export type GenerationStep =
    | "idle"
    | "finding_center"
    | "creating_polygon"
    | "snapping_to_roads"
    | "finding_waypoints"
    | "calculating_route"
    | "done";

export type ErrorSource = "overpass" | "brouter" | "app";

export type RouteShape = "circle" | "ellipse" | "triangle_tip";

export function selectRandomShape(shapes: RouteShape[]): RouteShape {
    return shapes[Math.floor(Math.random() * shapes.length)];
}

export interface RouteError {
    step: GenerationStep;
    source: ErrorSource;
    message: string;
}

interface RouteState extends GPXData {
    route: Feature<LineString>[];
    wayPoints: Position[];
    profileRoutes: Record<string, RouteResult>;
    loading: "idle" | "pending" | "succeeded" | "failed";
    startPoint: PseudoLatLng | null;
    centerPoint: Position | null;
    options: {
        length: number;
        profiles: Profile[];
        open: boolean;
        brouterUrl: string;
        overpassUrl: string;
        enabledShapes: RouteShape[];
    };
    showElevationMap: boolean;
    stepThroughMode: boolean;
    waitingForNextStep: boolean;
    debugFeatures: Feature[];
    fitToBounds: boolean;
    generationStep: GenerationStep;
    profileProgress: ProfileProgress | null;
    error: RouteError | null;
}

const noRoute = {
    route: [],
    wayPoints: [],
    profileRoutes: {} as Record<string, RouteResult>,
    startPoint: null,
    centerPoint: null,
    bounds: null,
    distance: 0,
    elevation: 0,
    debugFeatures: [],
};

export const DEFAULT_BROUTER_URL = "http://localhost:17777/brouter";
export const DEFAULT_OVERPASS_URL = "https://overpass.private.coffee/api/interpreter";

export const initialState: RouteState = {
    loading: "idle",
    options: {
        length: 50,
        profiles: [],
        open: true,
        brouterUrl: DEFAULT_BROUTER_URL,
        overpassUrl: DEFAULT_OVERPASS_URL,
        enabledShapes: ["circle"],
    },
    showElevationMap: false,
    stepThroughMode: false,
    waitingForNextStep: false,
    ...noRoute,
    fitToBounds: false,
    generationStep: "idle",
    profileProgress: null,
    error: null,
};

const routeSlice = createSlice({
    name: "route",
    initialState,
    reducers: {
        resetRoute: (state, { payload }: PayloadAction<boolean>) => {
            let { startPoint } = state;
            if (payload) {
                startPoint = null;
            }
            return { ...state, ...noRoute, startPoint, generationStep: "idle" };
        },
        setStartPoint: (state, { payload }: PayloadAction<PseudoLatLng>) => {
            state.startPoint = payload;
            if (!state.options.length || state.options.profiles.length === 0) {
                state.options.open = true;
            }
        },
        moveStartPoint: {
            reducer(state, { payload }: PayloadAction<PseudoLatLng>) {
                state.startPoint = payload;
                if (!state.options.length || state.options.profiles.length === 0) {
                    state.options.open = true;
                }
                const lastWaypoint = state.wayPoints.length - 1;
                if (lastWaypoint > 0) {
                    state.wayPoints[0] = [payload.lng, payload.lat];
                    state.wayPoints[lastWaypoint] = [payload.lng, payload.lat];
                }
            },
            prepare(payload) {
                return {
                    payload,
                    meta: {
                        throttle: {
                            time: 300,
                        },
                    },
                };
            },
        },
        setDesiredLength: (state, { payload }: PayloadAction<number>) => {
            state.options.length = payload;
        },
        toggleProfile: (state, { payload }: PayloadAction<Profile>) => {
            const profs = state.options.profiles;
            const index = profs.indexOf(payload);
            if (index >= 0) {
                if (profs.length > 1) {
                    profs.splice(index, 1);
                }
            } else {
                profs.push(payload);
            }
        },
        setBrouterUrl: (state, { payload }: PayloadAction<string>) => {
            state.options.brouterUrl = payload;
        },
        setOverpassUrl: (state, { payload }: PayloadAction<string>) => {
            state.options.overpassUrl = payload;
        },
        toggleShape: (state, { payload }: PayloadAction<RouteShape>) => {
            const shapes = state.options.enabledShapes;
            const index = shapes.indexOf(payload);

            if (index >= 0) {
                // Only remove if more than one shape is enabled (ensure at least one)
                if (shapes.length > 1) {
                    shapes.splice(index, 1);
                }
            } else {
                shapes.push(payload);
            }
        },
        toggleOptions: (state, { payload }: PayloadAction<boolean>) => {
            state.options.open = payload;
        },
        addDebugFeature: (state, { payload }: PayloadAction<Feature>) => {
            state.debugFeatures.push(payload);
        },
        clearDebugFeatures: (state) => {
            state.debugFeatures = [];
        },
        setCenterPoint: (state, { payload }: PayloadAction<Position>) => {
            state.centerPoint = payload;
        },
        moveCenterPoint: {
            reducer(state, { payload }: PayloadAction<Position>) {
                state.centerPoint = payload;
            },
            prepare(payload) {
                return {
                    payload,
                    meta: {
                        throttle: {
                            time: 300,
                        },
                    },
                };
            },
        },
        setWayPoints: (state, { payload }: PayloadAction<Position[]>) => {
            state.wayPoints = payload;
        },
        moveWayPoint: {
            reducer(state, { payload: { index, position } }: PayloadAction<{ index: number; position: Position }>) {
                state.wayPoints[index] = position;
            },
            prepare(payload) {
                return {
                    payload,
                    meta: {
                        throttle: {
                            time: 300,
                        },
                    },
                };
            },
        },
        moveProfileWayPoint: {
            reducer(
                state,
                { payload: { profile, index, position } }: PayloadAction<{ profile: string; index: number; position: Position }>
            ) {
                const result = state.profileRoutes[profile];
                if (result) {
                    result.wayPoints[index] = position;
                }
            },
            prepare(payload) {
                return {
                    payload,
                    meta: {
                        throttle: {
                            time: 300,
                        },
                    },
                };
            },
        },
        updateProfileRoute: (
            state,
            { payload: { profile, route } }: PayloadAction<{ profile: string; route: Feature<LineString>[] }>
        ) => {
            const result = state.profileRoutes[profile];
            if (result) {
                const { elevation, distance, bounds } = computeRouteStats(route);
                result.route = route;
                result.distance = distance;
                result.elevation = elevation;
                result.bounds = bounds;
            }
        },
        movePolygonVertex: {
            reducer(state, { payload: { index, position } }: PayloadAction<{ index: number; position: Position }>) {
                // Find the c2 polygon in debug features
                const polygonIndex = state.debugFeatures.findIndex(
                    (f) => f.geometry.type === "Polygon" && f.properties?.debugLabel === "c2"
                );
                if (polygonIndex !== -1) {
                    const polygon = state.debugFeatures[polygonIndex];
                    if (polygon.geometry.type === "Polygon") {
                        const coords = polygon.geometry.coordinates[0] as Position[];
                        coords[index] = position;
                        // If moving the first vertex, also update the last (they should be the same in a closed polygon)
                        if (index === 0) {
                            coords[coords.length - 1] = position;
                        }
                    }
                }
            },
            prepare(payload) {
                return {
                    payload,
                    meta: {
                        throttle: {
                            time: 300,
                        },
                    },
                };
            },
        },
        setPolygonVertices: (state, { payload }: PayloadAction<Position[]>) => {
            // Find the c2 polygon in debug features and update all its vertices
            const polygonIndex = state.debugFeatures.findIndex(
                (f) => f.geometry.type === "Polygon" && f.properties?.debugLabel === "c2"
            );
            if (polygonIndex !== -1) {
                const polygon = state.debugFeatures[polygonIndex];
                if (polygon.geometry.type === "Polygon") {
                    // Close the polygon by adding first vertex at the end
                    const closedVertices = [...payload, payload[0]];
                    polygon.geometry.coordinates[0] = closedVertices;
                }
            }
        },
        updateRoute: (state, { payload }: PayloadAction<Feature<LineString>[]>) => {
            const { elevation, distance, bounds } = computeRouteStats(payload);
            return {
                ...state,
                elevation,
                distance,
                bounds,
                route: payload,
            };
        },
        setProfileRouteResult: (
            state,
            { payload }: PayloadAction<{ profile: Profile; wayPoints: Position[]; route: Feature<LineString>[] }>
        ) => {
            const { elevation, distance, bounds } = computeRouteStats(payload.route);
            state.profileRoutes[payload.profile] = {
                route: payload.route,
                wayPoints: payload.wayPoints,
                distance,
                elevation,
                bounds,
            };
            // Also update top-level fields for backward compat (used by middleware, etc.)
            state.route = payload.route;
            state.wayPoints = payload.wayPoints;
            state.distance = distance;
            state.elevation = elevation;
            state.bounds = bounds;
        },
        setProfileProgress: (state, { payload }: PayloadAction<ProfileProgress | null>) => {
            state.profileProgress = payload;
        },
        toggleShowElevationMap: (state) => {
            state.showElevationMap = !state.showElevationMap;
        },
        toggleFitToBounds: (state) => {
            state.fitToBounds = !state.fitToBounds;
        },
        toggleStepThroughMode: (state) => {
            state.stepThroughMode = !state.stepThroughMode;
            if (!state.stepThroughMode) {
                state.waitingForNextStep = false;
            }
        },
        setWaitingForNextStep: (state, { payload }: PayloadAction<boolean>) => {
            state.waitingForNextStep = payload;
        },
        advanceStep: (state) => {
            state.waitingForNextStep = false;
        },
        setGenerationStep: (state, { payload }: PayloadAction<GenerationStep>) => {
            state.generationStep = payload;
        },
        setError: (state, { payload }: PayloadAction<RouteError | null>) => {
            state.error = payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchWayPointsAndRoute.fulfilled, (state) => {
            state.error = null;
        });
        builder.addCase(fetchWayPointsAndRoute.rejected, (state, action) => {
            const currentStep = state.generationStep;
            state.generationStep = "idle";

            // Parse error source from error message if available
            let source: ErrorSource = "app";
            const errorMessage = action.error.message || "An error occurred while generating the route";
            const lowerMessage = errorMessage.toLowerCase();

            if (lowerMessage.includes("overpass")) {
                source = "overpass";
            } else if (
                lowerMessage.includes("brouter") ||
                lowerMessage.includes("java.lang") ||
                currentStep === "calculating_route"
            ) {
                source = "brouter";
            } else if (currentStep === "snapping_to_roads") {
                source = "overpass";
            }

            state.error = {
                step: currentStep,
                source,
                message: errorMessage,
            };
            console.error("Route generation failed:", action.error);
        });
    },
});

export const {
    resetRoute,
    setStartPoint,
    setDesiredLength,
    toggleProfile,
    setBrouterUrl,
    setOverpassUrl,
    toggleShape,
    toggleOptions,
    addDebugFeature,
    clearDebugFeatures,
    setCenterPoint,
    moveCenterPoint,
    setWayPoints,
    moveWayPoint,
    moveProfileWayPoint,
    updateProfileRoute,
    movePolygonVertex,
    setPolygonVertices,
    moveStartPoint,
    updateRoute,
    setProfileRouteResult,
    setProfileProgress,
    toggleShowElevationMap,
    toggleFitToBounds,
    toggleStepThroughMode,
    setWaitingForNextStep,
    advanceStep,
    setGenerationStep,
    setError,
    clearError,
} = routeSlice.actions;

export const selectRoute = (state: RootState) => state.route.route;
export const selectWayPoints = (state: RootState) => state.route.wayPoints;

export const selectStartPoint = ({ route: { startPoint } }: RootState) =>
    startPoint ? denormalizeLatLng(startPoint) : null;

export const selectBounds = ({ route: { profileRoutes } }: RootState) => {
    const allBounds = Object.values(profileRoutes)
        .map((r) => r.bounds)
        .filter((b): b is PseudoLatLngBounds => b !== null);

    if (allBounds.length === 0) return null;

    const sw = {
        lat: Math.min(...allBounds.map((b) => b.southWest.lat)),
        lng: Math.min(...allBounds.map((b) => b.southWest.lng)),
    };
    const ne = {
        lat: Math.max(...allBounds.map((b) => b.northEast.lat)),
        lng: Math.max(...allBounds.map((b) => b.northEast.lng)),
    };
    return new LatLngBounds(denormalizeLatLng(sw as PseudoLatLng), denormalizeLatLng(ne as PseudoLatLng));
};

export const selectInfo = ({ route: { distance, elevation } }: RootState) => {
    return { distance, elevation };
};

export const selectDesiredLength = (state: RootState) => state.route.options.length;
export const selectProfiles = (state: RootState) => state.route.options.profiles;
export const selectOptionsState = (state: RootState) => state.route.options.open;
export const selectBrouterUrl = (state: RootState) => state.route.options.brouterUrl;
export const selectOverpassUrl = (state: RootState) => state.route.options.overpassUrl;
export const selectEnabledShapes = (state: RootState) => state.route.options.enabledShapes;
export const selectShowElevationMap = (state: RootState) => state.route.showElevationMap;
export const selectFitToBounds = (state: RootState) => state.route.fitToBounds;

export const selectDebugFeatures = ({ route: { debugFeatures } }: RootState) => debugFeatures;
export const selectCenterPoint = (state: RootState) => state.route.centerPoint;
export const selectPolygonVertices = ({ route: { debugFeatures } }: RootState): Position[] => {
    const polygon = debugFeatures.find((f) => f.geometry.type === "Polygon" && f.properties?.debugLabel === "c2");
    if (polygon && polygon.geometry.type === "Polygon") {
        // Return all vertices except the last one (which is a duplicate of the first to close the polygon)
        const coords = polygon.geometry.coordinates[0] as Position[];
        return coords.slice(0, -1);
    }
    return [];
};
export const selectProfileRoutes = (state: RootState) => state.route.profileRoutes;
export const selectProfileProgress = (state: RootState) => state.route.profileProgress;
export const selectStepThroughMode = (state: RootState) => state.route.stepThroughMode;
export const selectWaitingForNextStep = (state: RootState) => state.route.waitingForNextStep;
export const selectGenerationStep = (state: RootState) => state.route.generationStep;
export const selectError = (state: RootState) => state.route.error;

export default routeSlice.reducer;

function denormalizeLatLng({ lat, lng, alt }: PseudoLatLng) {
    return new LatLng(lat, lng, alt);
}

function computeRouteStats(routeSegments: Feature<LineString>[]): {
    elevation: number;
    distance: number;
    bounds: PseudoLatLngBounds | null;
} {
    let elevation = 0;
    let distance = 0;
    const featureGroup = new FeatureGroup();

    routeSegments.forEach((segment) => {
        elevation += parseInt(segment.properties?.["filtered ascend"] ?? 0);
        distance += parseInt(segment.properties?.["track-length"]);
        featureGroup.addLayer(new Polyline(segment.geometry.coordinates.map(turfToLatLng)));
    });

    if (routeSegments.length === 0) {
        return { elevation: 0, distance: 0, bounds: null };
    }

    const bounds = featureGroup.getBounds();
    return {
        elevation,
        distance,
        bounds: {
            southWest: { ...bounds.getSouthWest() },
            northEast: { ...bounds.getNorthEast() },
        },
    };
}
