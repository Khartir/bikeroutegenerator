import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Feature, LineString, Position } from "@turf/helpers";
import { LatLng, LatLngBounds, FeatureGroup, Polyline } from "leaflet";
import { turfToLatLng } from "../leaflet/leafletHelpers";
import { getWaypoints, GetRouteArgs, Profile, makeRoute, getDebugSetters } from "../routing/routeAPI";
import { setBrouterBaseUrl } from "../routing/imported/brouter";
import { AppDispatch, RootState } from "../state/store";
import { configureStepController, resetStepController } from "./stepController";

export const fetchWayPointsAndRoute = createAsyncThunk(
    "route/newWayPoints",
    async (args: GetRouteArgs, { dispatch, getState }) => {
        const initialState = getState() as RootState;
        configureStepController(
            initialState.route.stepThroughMode,
            (waiting) => dispatch(setWaitingForNextStep(waiting))
        );

        // Set BRouter URL from settings
        setBrouterBaseUrl(initialState.route.options.brouterUrl);

        try {
            dispatch(clearDebugFeatures());
            const wayPoints = await getWaypoints(args, dispatch as AppDispatch, getState as () => RootState);

            // After step 2 (creating_polygon), proceed directly to final route
            dispatch(setWayPoints(wayPoints));

            // Calculate the final route
            const state = getState() as RootState;
            const debug = getDebugSetters(dispatch as AppDispatch, state.route.stepThroughMode);
            dispatch(setGenerationStep("calculating_route"));
            const route = await makeRoute(wayPoints, args.profile, debug);

            dispatch(updateRoute(route));
            dispatch(toggleFitToBounds());
            dispatch(setGenerationStep("done"));

            return {
                wayPoints,
            };
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

export type GenerationStep =
    | "idle"
    | "finding_center"
    | "creating_polygon"
    | "snapping_to_roads"
    | "finding_waypoints"
    | "calculating_route"
    | "done";

export type ErrorSource = "overpass" | "brouter" | "app";

export interface RouteError {
    step: GenerationStep;
    source: ErrorSource;
    message: string;
}

interface RouteState extends GPXData {
    route: Feature<LineString>[];
    wayPoints: Position[];
    loading: "idle" | "pending" | "succeeded" | "failed";
    startPoint: PseudoLatLng | null;
    centerPoint: Position | null;
    options: {
        length: number;
        profile: Profile | "";
        open: boolean;
        brouterUrl: string;
        useEllipse: boolean;
    };
    showElevationMap: boolean;
    stepThroughMode: boolean;
    waitingForNextStep: boolean;
    debugFeatures: Feature[];
    fitToBounds: boolean;
    generationStep: GenerationStep;
    error: RouteError | null;
}

const noRoute = {
    route: [],
    wayPoints: [],
    startPoint: null,
    centerPoint: null,
    bounds: null,
    distance: 0,
    elevation: 0,
    debugFeatures: [],
};

export const DEFAULT_BROUTER_URL = "http://localhost:17777/brouter";

export const initialState: RouteState = {
    loading: "idle",
    options: {
        length: 50,
        profile: "",
        open: true,
        brouterUrl: DEFAULT_BROUTER_URL,
        useEllipse: false,
    },
    showElevationMap: false,
    stepThroughMode: false,
    waitingForNextStep: false,
    ...noRoute,
    fitToBounds: false,
    generationStep: "idle",
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
            if (!state.options.length || !state.options.profile) {
                state.options.open = true;
            }
        },
        moveStartPoint: {
            reducer(state, { payload }: PayloadAction<PseudoLatLng>) {
                state.startPoint = payload;
                if (!state.options.length || !state.options.profile) {
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
        setProfile: (state, { payload }: PayloadAction<Profile>) => {
            state.options.profile = payload;
        },
        setBrouterUrl: (state, { payload }: PayloadAction<string>) => {
            state.options.brouterUrl = payload;
        },
        toggleUseEllipse: (state) => {
            state.options.useEllipse = !state.options.useEllipse;
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
            let elevation = 0;
            let distance = 0;
            const featureGroup = new FeatureGroup();

            payload.forEach((segment) => {
                elevation += parseInt(segment.properties?.["filtered ascend"] ?? 0);
                distance += parseInt(segment.properties?.["track-length"]);
                featureGroup.addLayer(new Polyline(segment.geometry.coordinates.map(turfToLatLng)));
            });

            const bounds = featureGroup.getBounds();
            return {
                ...state,
                elevation,
                distance,
                bounds: {
                    southWest: { ...bounds.getSouthWest() },
                    northEast: { ...bounds.getNorthEast() },
                },
                route: payload,
            };
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
        builder.addCase(fetchWayPointsAndRoute.fulfilled, (state, { payload }) => {
            return { ...state, ...payload, error: null };
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
    setProfile,
    setBrouterUrl,
    toggleUseEllipse,
    toggleOptions,
    addDebugFeature,
    clearDebugFeatures,
    setCenterPoint,
    moveCenterPoint,
    setWayPoints,
    moveWayPoint,
    movePolygonVertex,
    setPolygonVertices,
    moveStartPoint,
    updateRoute,
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

export const selectBounds = ({ route: { bounds } }: RootState) =>
    bounds ? new LatLngBounds(denormalizeLatLng(bounds.southWest), denormalizeLatLng(bounds.northEast)) : null;

export const selectInfo = ({ route: { distance, elevation } }: RootState) => {
    return { distance, elevation };
};

export const selectDesiredLength = (state: RootState) => state.route.options.length;
export const selectProfile = (state: RootState) => state.route.options.profile;
export const selectOptionsState = (state: RootState) => state.route.options.open;
export const selectBrouterUrl = (state: RootState) => state.route.options.brouterUrl;
export const selectUseEllipse = (state: RootState) => state.route.options.useEllipse;
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
export const selectStepThroughMode = (state: RootState) => state.route.stepThroughMode;
export const selectWaitingForNextStep = (state: RootState) => state.route.waitingForNextStep;
export const selectGenerationStep = (state: RootState) => state.route.generationStep;
export const selectError = (state: RootState) => state.route.error;

export default routeSlice.reducer;

function denormalizeLatLng({ lat, lng, alt }: PseudoLatLng) {
    return new LatLng(lat, lng, alt);
}
